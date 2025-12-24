package com.example.sale_tech_web.feature.payment.service;

import com.example.sale_tech_web.feature.payment.config.PaymentConfig;
import com.example.sale_tech_web.feature.payment.config.VNPayConfig;
import com.example.sale_tech_web.feature.payment.dto.VNPayPaymentResponse;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundRequest;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundResponse;
import com.example.sale_tech_web.feature.payment.util.VNPayUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    /**
     * Create VNPay payment URL
     *
     * @param orderId   Order ID
     * @param amount    Total amount in VND
     * @param orderInfo Order description
     * @param request   HttpServletRequest to get IP address
     * @return VNPayPaymentResponse with payment URL
     */
    public VNPayPaymentResponse createPayment(Long orderId, Integer amount, String orderInfo, HttpServletRequest request) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "other";

            // Amount must be in smallest unit (VND * 100)
            long vnp_Amount = amount * 100L;

            // Generate unique transaction reference
            String vnp_TxnRef = VNPayUtil.getRandomNumber(8);
            String vnp_IpAddr = VNPayUtil.getIpAddress(request);
            String vnp_TmnCode = vnPayConfig.getTmnCode();

            // Build parameters
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", orderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
//            vnp_Params.put("vnp_IpnUrl", vnPayConfig.getIpnUrl());

            // Create date and expire date
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, PaymentConfig.PAYMENT_TIMEOUT_MINUTES);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Build query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;

            log.info("Created VNPay payment URL for order: {}, txnRef: {}", orderId, vnp_TxnRef);

            return VNPayPaymentResponse.builder()
                    .paymentUrl(paymentUrl)
                    .txnRef(vnp_TxnRef)
                    .orderId(orderId)
                    .build();

        } catch (UnsupportedEncodingException e) {
            log.error("Error creating VNPay payment URL", e);
            throw new RuntimeException("Failed to create payment URL", e);
        }
    }

    /**
     * Verify payment callback from VNPay
     *
     * @param params All parameters from VNPay
     * @return true if signature is valid
     */
    public boolean verifyPaymentCallback(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");

        // Remove hash params before verification
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // Calculate hash
        String signValue = VNPayUtil.hashAllFields(params, vnPayConfig.getHashSecret());

        log.info("Verifying VNPay callback - Received hash: {}, Calculated hash: {}", vnp_SecureHash, signValue);

        return signValue.equals(vnp_SecureHash);
    }

    /**
     * Process VNPay refund request
     *
     * @param refundRequest Refund request data
     * @param request HttpServletRequest to get IP address
     * @return VNPayRefundResponse with refund result
     */
    public VNPayRefundResponse processRefund(VNPayRefundRequest refundRequest, HttpServletRequest request) {
        try {
            // Generate request ID
            String vnp_RequestId = VNPayUtil.getRandomNumber(8);
            String vnp_Version = "2.1.0";
            String vnp_Command = "refund";
            String vnp_TmnCode = vnPayConfig.getTmnCode();
            String vnp_TransactionType = refundRequest.getTransactionType(); // "02": toàn phần, "03": một phần
            String vnp_TxnRef = refundRequest.getTxnRef();

            // Amount must be in smallest unit (VND * 100)
            long amount = refundRequest.getAmount() * 100L;
            String vnp_Amount = String.valueOf(amount);

            String vnp_OrderInfo = refundRequest.getOrderInfo() != null
                ? refundRequest.getOrderInfo()
                : "Hoan tien GD OrderId:" + vnp_TxnRef;

            String vnp_TransactionNo = refundRequest.getTransactionNo() != null
                ? refundRequest.getTransactionNo()
                : "";

            String vnp_TransactionDate = refundRequest.getTransactionDate();
            String vnp_CreateBy = refundRequest.getCreateBy();

            // Create current date
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());

//            String vnp_IpAddr = VNPayUtil.getIpAddress(request);
            String vnp_IpAddr = "127.0.0.1"; // For testing purposes

            // Build JSON params
            JsonObject vnp_Params = new JsonObject();
            vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
            vnp_Params.addProperty("vnp_Version", vnp_Version);
            vnp_Params.addProperty("vnp_Command", vnp_Command);
            vnp_Params.addProperty("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.addProperty("vnp_TransactionType", vnp_TransactionType);
            vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.addProperty("vnp_Amount", vnp_Amount);
            vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);

            if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
                vnp_Params.addProperty("vnp_TransactionNo", vnp_TransactionNo);
            }

            vnp_Params.addProperty("vnp_TransactionDate", vnp_TransactionDate);
            vnp_Params.addProperty("vnp_CreateBy", vnp_CreateBy);
            vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddr);

            // Create secure hash
            String hash_Data = String.join("|",
                vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                vnp_TransactionType, vnp_TxnRef, vnp_Amount,
                vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty() ? vnp_TransactionNo : "",
                vnp_TransactionDate, vnp_CreateBy, vnp_CreateDate,
                vnp_IpAddr, vnp_OrderInfo);

            String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hash_Data);
            vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

            // Send request to VNPay API
            URL url = new URL(vnPayConfig.getApiUrl());
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            DataOutputStream wr = new DataOutputStream(con.getOutputStream());
            wr.writeBytes(vnp_Params.toString());
            wr.flush();
            wr.close();

            int responseCode = con.getResponseCode();
            log.info("Sending 'POST' request to URL: {}", url);
            log.info("Post Data: {}", vnp_Params);
            log.info("Response Code: {}", responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String output;
            StringBuilder response = new StringBuilder();
            while ((output = in.readLine()) != null) {
                response.append(output);
            }
            in.close();

            log.info("VNPay Refund Response: {}", response.toString());

            // Parse response
            Gson gson = new Gson();
            JsonObject responseJson = gson.fromJson(response.toString(), JsonObject.class);

            return VNPayRefundResponse.builder()
                    .responseCode(responseJson.has("vnp_ResponseCode") ? responseJson.get("vnp_ResponseCode").getAsString() : "")
                    .message(responseJson.has("vnp_Message") ? responseJson.get("vnp_Message").getAsString() : "")
                    .transactionNo(responseJson.has("vnp_TransactionNo") ? responseJson.get("vnp_TransactionNo").getAsString() : "")
                    .txnRef(responseJson.has("vnp_TxnRef") ? responseJson.get("vnp_TxnRef").getAsString() : vnp_TxnRef)
                    .amount(refundRequest.getAmount())
                    .bankCode(responseJson.has("vnp_BankCode") ? responseJson.get("vnp_BankCode").getAsString() : "")
                    .orderInfo(vnp_OrderInfo)
                    .payDate(responseJson.has("vnp_PayDate") ? responseJson.get("vnp_PayDate").getAsString() : "")
                    .transactionStatus(responseJson.has("vnp_TransactionStatus") ? responseJson.get("vnp_TransactionStatus").getAsString() : "")
                    .build();

        } catch (Exception e) {
            log.error("Error processing VNPay refund", e);
            return VNPayRefundResponse.builder()
                    .responseCode("99")
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
}

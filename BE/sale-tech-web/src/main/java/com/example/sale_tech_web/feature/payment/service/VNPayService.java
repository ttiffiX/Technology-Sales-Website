package com.example.sale_tech_web.feature.payment.service;

import com.example.sale_tech_web.feature.payment.config.VNPayConfig;
import com.example.sale_tech_web.feature.payment.dto.VNPayPaymentResponse;
import com.example.sale_tech_web.feature.payment.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
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
     * @param orderId Order ID
     * @param amount Total amount in VND
     * @param orderInfo Order description
     * @param request HttpServletRequest to get IP address
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

            cld.add(Calendar.MINUTE, 15); // Payment expires in 15 minutes
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
}


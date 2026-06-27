package com.example.sale_tech_web.controller.customer;

import com.example.sale_tech_web.feature.payment.vnpay_manager.PaymentProcessingService;
import com.example.sale_tech_web.feature.payment.vnpay_manager.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final PaymentProcessingService paymentProcessingService;

    /**
     * VNPay Return URL - Called when user is redirected back from VNPay
     * Frontend will call this endpoint to verify payment result
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<Map<String, Object>> vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("VNPay callback received with params: {}", params);

        Map<String, Object> response = new HashMap<>();

        try {
            // Verify signature
            if (!vnPayService.verifyPaymentCallback(params)) {
                log.error("Invalid VNPay signature");
                response.put("success", false);
                response.put("message", "Invalid signature");
                return ResponseEntity.badRequest().body(response);
            }

            // Get payment info
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_OrderInfo = params.get("vnp_OrderInfo");

            // Check if payment is successful
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                log.info("VNPay payment successful - TxnRef: {}", vnp_TxnRef);

                response.put("success", true);
                response.put("message", "Payment successful");
            } else {
                log.info("VNPay payment failed - ResponseCode: {}, TransactionStatus: {}",
                        vnp_ResponseCode, vnp_TransactionStatus);

                response.put("success", false);
                response.put("message", "Payment failed or cancelled");
                response.put("responseCode", vnp_ResponseCode);
            }

            response.put("txnRef", vnp_TxnRef);
            response.put("amount", Long.parseLong(vnp_Amount) / 100); // Convert back to VND
            response.put("orderInfo", vnp_OrderInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing VNPay callback", e);
            response.put("success", false);
            response.put("message", "Error processing payment callback");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * VNPay IPN (Instant Payment Notification) - Called by VNPay server
     * Backup endpoint for localhost (IPN cannot reach localhost)
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIPN(@RequestParam Map<String, String> params) {
        log.info("VNPay IPN received: {}", params);

        Map<String, String> response = new HashMap<>();

        try {
            // 1. Verify signature
            if (!vnPayService.verifyPaymentCallback(params)) {
                log.error("Invalid signature in VNPay IPN");
                response.put("RspCode", "97");
                response.put("Message", "Invalid Checksum");
                return ResponseEntity.ok(response);
            }

            // 2. Extract payment info
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_PayDate = params.get("vnp_PayDate");

//            Long orderId = paymentProcessingService.extractOrderId(vnp_OrderInfo);
//            if (orderId == null) {
//                response.put("RspCode", "01");
//                response.put("Message", "Order not Found");
//                return ResponseEntity.ok(response);
//            }

            long amount = Long.parseLong(vnp_Amount);
            String rspCode;

            // 3. Process payment
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                rspCode = paymentProcessingService.processSuccessfulPayment(vnp_TxnRef, amount, vnp_TransactionNo, vnp_PayDate);

            } else {
                rspCode = paymentProcessingService.processFailedPayment(vnp_TxnRef, vnp_TransactionNo, vnp_PayDate);

            }
            response.put("RspCode", rspCode);
            switch (rspCode) {
                case "00":
                    response.put("Message", "Confirm Success");
                    break;
                case "01":
                    response.put("Message", "Order not found");
                    break;
                case "02":
                    response.put("Message", "Order already confirmed");
                    break;
                case "04":
                    response.put("Message", "Invalid amount");
                    break;
                default:
                    response.put("Message", "Unknown error");
                    break;
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Fatal error processing VNPay IPN", e);
            response.put("RspCode", "99");
            response.put("Message", "Unknow error");
            return ResponseEntity.ok(response);
        }
    }
}


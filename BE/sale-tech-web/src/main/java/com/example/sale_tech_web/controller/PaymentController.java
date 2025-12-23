package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.payment.service.PaymentProcessingService;
import com.example.sale_tech_web.feature.payment.service.VNPayService;
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
            boolean isValid = vnPayService.verifyPaymentCallback(params);

            if (!isValid) {
                log.error("Invalid VNPay signature");
                response.put("success", false);
                response.put("message", "Invalid payment signature");
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
                response.put("txnRef", vnp_TxnRef);
                response.put("amount", Long.parseLong(vnp_Amount) / 100); // Convert back to VND
                response.put("orderInfo", vnp_OrderInfo);

                return ResponseEntity.ok(response);
            } else {
                log.warn("VNPay payment failed - ResponseCode: {}, TransactionStatus: {}",
                        vnp_ResponseCode, vnp_TransactionStatus);

                response.put("success", false);
                response.put("message", "Payment failed or cancelled");
                response.put("responseCode", vnp_ResponseCode);

                return ResponseEntity.ok(response);
            }

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
        log.info("VNPay IPN received");

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
            String vnp_OrderInfo = params.get("vnp_OrderInfo");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

            Long orderId = paymentProcessingService.extractOrderId(vnp_OrderInfo);
            if (orderId == null) {
                response.put("RspCode", "01");
                response.put("Message", "Order not Found");
                return ResponseEntity.ok(response);
            }

            long amount = Long.parseLong(vnp_Amount);

            // 3. Process payment
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                paymentProcessingService.processSuccessfulPayment(orderId, amount);
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                paymentProcessingService.processFailedPayment(orderId);
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Business error in VNPay IPN: {}", e.getMessage());
            response.put("RspCode", "01");
            response.put("Message", e.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing VNPay IPN", e);
            response.put("RspCode", "99");
            response.put("Message", "System Error");
            return ResponseEntity.ok(response);
        }
    }
}


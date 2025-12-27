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
            String vnp_TxnRef = params.get("vnp_TxnRef");

            Long orderId = paymentProcessingService.extractOrderId(vnp_OrderInfo);
            if (orderId == null) {
                response.put("RspCode", "01");
                response.put("Message", "Order not Found");
                return ResponseEntity.ok(response);
            }

            long amount = Long.parseLong(vnp_Amount);

            // 3. Process payment
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                paymentProcessingService.processSuccessfulPayment(orderId, amount, vnp_TxnRef);
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                paymentProcessingService.processFailedPayment(orderId, vnp_TxnRef);
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

//    /**
//     * Check payment status and timeout
//     * Frontend can call this to check if payment has expired
//     * @param orderId Order ID
//     * @return Payment status information including expiration status
//     */
//    @GetMapping("/status/{orderId}")
//    public ResponseEntity<Map<String, Object>> checkPaymentStatus(@PathVariable Long orderId) {
//        log.info("Checking payment status for order: {}", orderId);
//
//        try {
//            Payment payment = paymentRepository.findByOrderId(orderId)
//                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Payment not found for order: " + orderId));
//
//            boolean isExpired = payment.isExpired();
//
//            // Auto-cancel if expired and still PENDING
//            if (isExpired && payment.getStatus() == com.example.sale_tech_web.feature.payment.enums.PaymentStatus.PENDING) {
//                log.info("Payment for order {} has expired, auto-cancelling", orderId);
//                paymentProcessingService.processFailedPayment(orderId, null);
//                // Refresh payment status after processing
//                payment = paymentRepository.findByOrderId(orderId)
//                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Payment not found"));
//            }
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("orderId", orderId);
//            response.put("paymentId", payment.getId());
//            response.put("status", payment.getStatus().toString());
//            response.put("isExpired", isExpired);
//            response.put("remainingSeconds", payment.getRemainingSeconds());
//            response.put("createdAt", payment.getCreatedAt());
//            response.put("expiresAt", payment.getExpiresAt());
//            response.put("amount", payment.getAmount());
//            response.put("provider", payment.getProvider().toString());
//
//            return ResponseEntity.ok(response);
//
//        } catch (ResponseStatusException e) {
//            throw e;
//        } catch (Exception e) {
//            log.error("Error checking payment status for order: {}", orderId, e);
//            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Error checking payment status");
//        }
//    }
}


package com.example.sale_tech_web.feature.payment.processor;

import com.example.sale_tech_web.config.app.CacheNames;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.dto.VNPayPaymentResponse;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundRequest;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundResponse;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.payment.vnpay_manager.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class VNPayPaymentProcessor implements PaymentProcessor {

    private final PaymentRepository paymentRepository;
    private final VNPayService vnPayService;

    @Autowired
    private CacheManager cacheManager;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public Object createPayment(Order order, Map<String, Object> params) {
        HttpServletRequest httpRequest = (HttpServletRequest) params.get("httpRequest");

        String orderInfo = "Thanh toan don hang " + order.getId();
        VNPayPaymentResponse vnpayResponse = vnPayService.createPayment(
                order.getId(), order.getTotalPrice(), orderInfo, httpRequest
        );

        LocalDateTime now = LocalDateTime.now();

        Payment payment = Payment.builder()
                .order(order)
                .status(PaymentStatus.PENDING)
                .provider(PaymentMethod.VNPAY)
                .amount(order.getTotalPrice())
                .content("Thanh toan VNPay cho don hang #" + order.getId())
                .transactionId(vnpayResponse.getTxnRef())
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(Payment.calculateExpiresAt(now))
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("VNPay payment created with ID: {}, status: PENDING, expiresAt: {}",
                savedPayment.getId(), savedPayment.getExpiresAt());

        Objects.requireNonNull(cacheManager.getCache(CacheNames.PAYMENT))
                .put(vnpayResponse.getOrderId(), vnpayResponse);

        return vnpayResponse;
    }

    @Override
    public String cancelPayment(Order order, Map<String, Object> params) {
        HttpServletRequest httpRequest = (HttpServletRequest) params.get("httpRequest");

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) throw new NotFoundException("Payment not found for order ID: " + order.getId());

        // 1. Trường hợp đã thanh toán qua VNPay -> Tiến hành hoàn tiền (Refund)
        if (payment.getStatus() == PaymentStatus.PAID) {
            VNPayRefundRequest refundRequest =
                    VNPayRefundRequest.builder()
                            .txnRef(payment.getTransactionId())
                            .amount(Long.valueOf(payment.getAmount()))
                            .transactionType("02") // Full refund
                            .transactionDate(payment.getVnpPayDate())
                            .transactionNo(payment.getVnpTransactionNo())
                            .createBy(order.getUser().getUsername())
                            .orderInfo("Hoan tien don hang " + order.getId())
                            .build();

            VNPayRefundResponse refundResponse =
                    vnPayService.processRefund(refundRequest, httpRequest);

            if ("00".equals(refundResponse.getResponseCode())) {
                payment.setStatus(PaymentStatus.REFUND);
                paymentRepository.save(payment);
                return " and payment has been refunded successfully";
            } else {
                payment.setStatus(PaymentStatus.REFUND_FAILED);
                paymentRepository.save(payment);
                return " but refund failed: " + refundResponse.getMessage();
            }
        }

        // 2. Trường hợp VNPay vẫn đang PENDING thanh toán -> Đánh dấu FAILED luôn
        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return " and pending payment has been cancelled";
        }

        return "";
    }
}


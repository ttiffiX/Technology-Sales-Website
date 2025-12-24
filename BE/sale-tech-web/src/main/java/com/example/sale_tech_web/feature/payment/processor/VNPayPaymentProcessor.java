package com.example.sale_tech_web.feature.payment.processor;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class VNPayPaymentProcessor implements PaymentProcessor {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public Payment createPayment(Order order, Map<String, Object> params) {
        String txnRef = (String) params.get("txnRef");
        LocalDateTime now = LocalDateTime.now();

        Payment payment = Payment.builder()
                .order(order)
                .status(PaymentStatus.PENDING)
                .provider(PaymentMethod.VNPAY)
                .amount(order.getTotalPrice())
                .content("Thanh toan VNPay cho don hang #" + order.getId())
                .transactionId(txnRef)
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(Payment.calculateExpiresAt(now))
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("VNPay payment created with ID: {}, status: PENDING, expiresAt: {}",
                savedPayment.getId(), savedPayment.getExpiresAt());

        return savedPayment;
    }
}


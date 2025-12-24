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
public class CashPaymentProcessor implements PaymentProcessor {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.CASH;
    }

    @Override
    public Payment createPayment(Order order, Map<String, Object> params) {
        Payment payment = Payment.builder()
                .order(order)
                .status(PaymentStatus.PENDING)  // Chờ giao hàng
                .provider(PaymentMethod.CASH)
                .amount(order.getTotalPrice())
                .content("Thanh toan tien mat cho don hang #" + order.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                // Không cần: transactionId, rawResponse
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("CASH payment created with ID: {}, status: PENDING", savedPayment.getId());

        return savedPayment;
    }
}


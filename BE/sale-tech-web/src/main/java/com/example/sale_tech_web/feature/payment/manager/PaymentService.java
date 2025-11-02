package com.example.sale_tech_web.feature.payment.manager;

import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public void setPayment(Long order_id, String payment_method) {
        Payment payment;
        if (Objects.equals(payment_method, "Card")) {
            payment = Payment.builder()
                    .orderId(order_id)
                    .paymentMethod(payment_method)
                    .status("paid")
                    .build();
        } else {
            payment = Payment.builder()
                    .orderId(order_id)
                    .paymentMethod(payment_method)
                    .status("pending")
                    .build();
        }
        paymentRepository.save(payment);
    }

    public void cancelPayment(Long order_id) {

        List<Payment> payment = paymentRepository.findAll().stream().filter(p -> Objects.equals(p.getOrderId(), order_id)).toList();
        payment.forEach(p -> p.setStatus("cancelled"));
    }
}


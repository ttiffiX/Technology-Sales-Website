package com.example.sale_tech_web.feature.payment.manager;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.processor.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentService implements PaymentServiceInterface {
    private final Map<PaymentMethod, PaymentProcessor> processors;

    public PaymentService(
            List<PaymentProcessor> processorList
    ) {

        // Build map: PaymentMethod -> PaymentProcessor
        this.processors = processorList.stream()
                .collect(Collectors.toMap(
                        PaymentProcessor::getPaymentMethod,
                        Function.identity()
                ));

        log.info("PaymentService initialized with {} processors: {}",
                processors.size(),
                processors.keySet());
    }

    @Override
    @Transactional
    public Payment createPayment(Order order, PaymentMethod paymentMethod, Map<String, Object> params) {
        PaymentProcessor processor = getProcessor(paymentMethod);

        // Use empty map if params is null
        Map<String, Object> safeParams = params != null ? params : new HashMap<>();

        return processor.createPayment(order, safeParams);
    }

    private PaymentProcessor getProcessor(PaymentMethod method) {
        PaymentProcessor processor = processors.get(method);
        if (processor == null) {
            throw new IllegalArgumentException(
                    "No processor found for payment method: " + method);
        }
        return processor;
    }
}


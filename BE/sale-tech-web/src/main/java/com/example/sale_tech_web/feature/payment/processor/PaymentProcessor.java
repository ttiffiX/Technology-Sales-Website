package com.example.sale_tech_web.feature.payment.processor;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;

import java.util.Map;

public interface PaymentProcessor {
    PaymentMethod getPaymentMethod();

    Object createPayment(Order order, Map<String, Object> params);

    String cancelPayment(Order order, Map<String, Object> params);
}
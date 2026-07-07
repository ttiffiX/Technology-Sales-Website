package com.example.sale_tech_web.feature.payment.manager;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;

import java.util.Map;

public interface PaymentServiceInterface {
    Object createPayment(Order order, PaymentMethod paymentMethod, Map<String, Object> params);

    String cancelPayment(Order order, PaymentMethod paymentMethod, Map<String, Object> params);
}


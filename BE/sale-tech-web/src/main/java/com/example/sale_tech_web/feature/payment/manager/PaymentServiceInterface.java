package com.example.sale_tech_web.feature.payment.manager;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;

import java.util.Map;

public interface PaymentServiceInterface {
    Payment createPayment(Order order, PaymentMethod paymentMethod, Map<String, Object> params);

//    Payment updatePaymentSuccess(Long orderId, String transactionNo, Map<String, String> rawResponse);
//
//    Payment updatePaymentFailed(Long orderId, String reason);
//
//    Payment markCashPaymentAsCompleted(Long orderId);

//    Payment refundPayment(Long orderId);
//
//    Payment getPaymentByOrderId(Long orderId);
//
//    boolean hasPayment(Long orderId);
}


package com.example.sale_tech_web.feature.revenue.entity;

public interface PaymentMethodRevenueProjection {
    String getPaymentMethod();

    Long getTotalRevenue();

    Long getTotalQuantitySold();

    Long getOrderCount();
}

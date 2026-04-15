package com.example.sale_tech_web.feature.revenue.entity;

public interface CategoryRevenueProjection {
    Long getCategoryId();

    String getCategoryName();

    Long getTotalQuantitySold();

    Long getTotalRevenue();
}

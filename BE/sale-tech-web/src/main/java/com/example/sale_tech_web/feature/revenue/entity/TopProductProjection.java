package com.example.sale_tech_web.feature.revenue.entity;

public interface TopProductProjection {
    Long getProductId();

    String getProductTitle();

    Long getCategoryId();

    String getCategoryName();

    Long getTotalQuantitySold();

    Long getTotalRevenue();
}

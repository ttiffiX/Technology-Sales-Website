package com.example.sale_tech_web.feature.revenue.entity;

public interface HourlyRevenueProjection {
    Integer getHour();

    Long getRevenue();

    Long getOrderCount();
}

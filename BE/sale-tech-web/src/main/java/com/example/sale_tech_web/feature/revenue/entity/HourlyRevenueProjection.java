package com.example.sale_tech_web.feature.revenue.entity;

public interface HourlyRevenueProjection {
    Integer getReportHour();

    Long getTotalRevenue();

    Long getOrderCount();
}

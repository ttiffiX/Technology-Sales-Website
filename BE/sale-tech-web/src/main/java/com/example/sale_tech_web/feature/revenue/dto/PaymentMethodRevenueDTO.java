package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodRevenueDTO {
    private String paymentMethod;
    private Long totalRevenue;
    private Long totalQuantitySold;
    private Long orderCount;
    private Double revenuePercentage;
}


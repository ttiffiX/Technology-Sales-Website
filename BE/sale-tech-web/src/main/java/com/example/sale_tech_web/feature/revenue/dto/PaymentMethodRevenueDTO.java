package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodRevenueDTO {
    private List<PaymentMethodRevenue> paymentMethodRevenues;
    private DateRangeDTO range;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentMethodRevenue {
        private String paymentMethod;
        private Long totalRevenue;
        private Long totalQuantitySold;
        private Long orderCount;
        private Double revenuePercentage;
    }
}
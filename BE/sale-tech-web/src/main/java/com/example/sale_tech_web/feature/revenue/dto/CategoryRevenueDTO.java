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
public class CategoryRevenueDTO {
    private List<CategoryRevenue> categoryRevenues;
    private DateRangeDTO range;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryRevenue {
        private Long categoryId;
        private String categoryName;
        private Long totalQuantitySold;
        private Long totalRevenue;
        private Double revenuePercentage;
    }
}


package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopProductDTO {
    private Long productId;
    private String productTitle;
    private Long categoryId;
    private String categoryName;
    private Long totalQuantitySold;
    private Long totalRevenue;
}


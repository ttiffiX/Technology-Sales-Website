package com.example.sale_tech_web.feature.product_reviews.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewStarsDTO {
    private Long productId;
    private long totalReviewCount;
    private double averageRating;
    private Map<Integer, Long> ratingCounts;
}


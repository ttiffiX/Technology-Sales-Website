package com.example.sale_tech_web.feature.product_reviews.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewUpdateRequest {
    @NotNull
    private Long reviewId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}


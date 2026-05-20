package com.example.sale_tech_web.feature.product_reviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewReplyDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userRole;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


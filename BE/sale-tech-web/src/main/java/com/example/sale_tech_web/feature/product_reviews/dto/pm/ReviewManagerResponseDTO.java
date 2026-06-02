package com.example.sale_tech_web.feature.product_reviews.dto.pm;

import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewManagerResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer reviewStatusCode;
    private ReviewStatus reviewStatus;
    private Boolean isDeleted;
    private List<ProductReviewReplyDTO> replies;
}

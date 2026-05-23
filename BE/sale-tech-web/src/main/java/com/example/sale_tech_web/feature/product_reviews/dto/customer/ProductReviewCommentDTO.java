package com.example.sale_tech_web.feature.product_reviews.dto.customer;

import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
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
public class ProductReviewCommentDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userRealName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProductReviewReplyDTO> replies;
}


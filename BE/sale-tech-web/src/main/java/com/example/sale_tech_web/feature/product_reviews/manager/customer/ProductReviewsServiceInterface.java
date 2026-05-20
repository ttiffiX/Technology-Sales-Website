package com.example.sale_tech_web.feature.product_reviews.manager.customer;

import com.example.sale_tech_web.feature.product_reviews.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductReviewsServiceInterface {
    ProductReviewStarsDTO getProductStars(Long productId);

    Page<ProductReviewCommentDTO> getProductComments(Long productId, Integer rating, Pageable pageable);

    ProductReviewCommentDTO addReview(ProductReviewCreateRequest request);

    ProductReviewCommentDTO updateReview(ProductReviewUpdateRequest request);

    String deleteReview(Long reviewId);
}

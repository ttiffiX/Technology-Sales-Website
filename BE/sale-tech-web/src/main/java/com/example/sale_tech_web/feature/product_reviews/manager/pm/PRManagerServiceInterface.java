package com.example.sale_tech_web.feature.product_reviews.manager.pm;


import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReplyRequestDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReviewManagerResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PRManagerServiceInterface {

    Page<ReviewManagerResponseDTO> getAllReviewsForManager(Long id, String keyword, Integer star, Integer status, Boolean isDeleted, Pageable pageable);

    ProductReviewReplyDTO addReplyFromPM(Long reviewId, ReplyRequestDTO replyRequestDTO);

    ProductReviewReplyDTO updateReplyByPM(Long replyId, ReplyRequestDTO replyRequestDTO);

    String markAsResolved(Long reviewId);

    String deleteReplyByPM(Long replyId);

    String forceDeleteCustomerReview(Long reviewId);
}
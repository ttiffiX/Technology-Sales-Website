package com.example.sale_tech_web.feature.product_reviews.manager.pm;


import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReplyRequestDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReviewManagerResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PRManagerServiceInterface {

    Page<ReviewManagerResponseDTO> getAllReviewsForManager(Long productId, String productName, Integer star, Integer status, Pageable pageable);

    ReviewManagerResponseDTO addReplyFromPM(Long productId, ReplyRequestDTO replyRequestDTO);

    ReviewManagerResponseDTO updateReplyByPM(Long replyId, ReplyRequestDTO replyRequestDTO);

    String deleteReplyByPM(Long replyId);

    String forceDeleteCustomerReview(Long reviewId);
}
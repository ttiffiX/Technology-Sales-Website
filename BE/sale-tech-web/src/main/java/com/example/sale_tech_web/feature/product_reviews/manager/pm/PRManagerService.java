package com.example.sale_tech_web.feature.product_reviews.manager.pm;

import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReplyRequestDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReviewManagerResponseDTO;
import com.example.sale_tech_web.feature.product_reviews.repository.ProductReviewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PRManagerService implements PRManagerServiceInterface {
    private final ProductReviewsRepository productReviewsRepository;


    @Override
    public Page<ReviewManagerResponseDTO> getAllReviewsForManager(Long productId, String productName, Integer star, Integer status, Pageable pageable) {
        return null;
    }

    @Override
    public ReviewManagerResponseDTO addReplyFromPM(Long productId, ReplyRequestDTO replyRequestDTO) {
        return null;
    }

    @Override
    public ReviewManagerResponseDTO updateReplyByPM(Long replyId, ReplyRequestDTO replyRequestDTO) {
        return null;
    }

    @Override
    public String deleteReplyByPM(Long replyId) {
        return "";
    }

    @Override
    public String forceDeleteCustomerReview(Long reviewId) {
        return "";
    }
}
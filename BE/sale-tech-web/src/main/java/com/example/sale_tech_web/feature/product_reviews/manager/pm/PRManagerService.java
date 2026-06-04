package com.example.sale_tech_web.feature.product_reviews.manager.pm;

import com.example.sale_tech_web.exception.ConflictException;
import com.example.sale_tech_web.exception.ForbiddenException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.UnauthorizedException;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReplyRequestDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReviewManagerResponseDTO;
import com.example.sale_tech_web.feature.product_reviews.entity.ProductReviews;
import com.example.sale_tech_web.feature.product_reviews.enums.ReviewStatus;
import com.example.sale_tech_web.feature.product_reviews.manager.ProductReviewHelperService;
import com.example.sale_tech_web.feature.product_reviews.repository.ProductReviewsRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.example.sale_tech_web.utils.StringUtils.normalizeText;

@Service
@RequiredArgsConstructor
public class PRManagerService implements PRManagerServiceInterface {
    private final ProductReviewsRepository productReviewsRepository;
    private final ProductReviewHelperService reviewHelperService;
    private final UserRepository userRepository;

    @Override
    public Page<ReviewManagerResponseDTO> getAllReviewsForManager(Long id, String keyword, Integer star, Integer status, Boolean isDeleted, Pageable pageable) {
        ReviewStatus enumStatus = status != null ? ReviewStatus.fromCode(status) : null;

        Page<ProductReviews> reviewsPage = productReviewsRepository.findAllReviewsForManager(
                id, keyword, star, enumStatus, isDeleted, pageable
        );

        List<Long> parentIds = reviewsPage.getContent().stream()
                .map(ProductReviews::getId)
                .toList();

        Map<Long, List<ProductReviewReplyDTO>> repliesByParentId = reviewHelperService.loadRepliesByParentIds(parentIds, true);

        List<ReviewManagerResponseDTO> content = reviewsPage.getContent().stream()
                .map(review -> toCommentDTO(review, repliesByParentId.getOrDefault(review.getId(), Collections.emptyList())))
                .toList();

        return new PageImpl<>(content, pageable, reviewsPage.getTotalElements());
    }

    @Override
    @Transactional
    public ProductReviewReplyDTO addReplyFromPM(Long reviewId, ReplyRequestDTO request) {
        Long userId = getUserIdFromToken();

        Users users = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        ProductReviews parentReview = productReviewsRepository.findRootReviewById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        if (productReviewsRepository.existsByParentId(reviewId)) {
            throw new ConflictException("This review has been responded to.");
        }

        ProductReviews reply = ProductReviews.builder()
                .product(parentReview.getProduct())
                .user(users)
                .rating(null) // PM reply không có sao
                .comment(normalizeText(request.getComment()))
                .parentId(reviewId)
                .isDeleted(false)
                .processStatus(null)
                .build();

        if (parentReview.getProcessStatus() == ReviewStatus.PENDING) {
            parentReview.setProcessStatus(ReviewStatus.REPLIED);
            productReviewsRepository.save(parentReview);
        }

        ProductReviews saved = productReviewsRepository.save(reply);

        return toReplyDTO(saved);
    }

    @Override
    @Transactional
    public ProductReviewReplyDTO updateReplyByPM(Long replyId, ReplyRequestDTO replyRequestDTO) {
        Long userId = getUserIdFromToken();

        Users users = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        ProductReviews reply = productReviewsRepository.findByReviewId(replyId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        checkOwnershipOrAdmin(users, reply.getUser());

        reply.setComment(replyRequestDTO.getComment());
        ProductReviews saved = productReviewsRepository.save(reply);

        return toReplyDTO(saved);
    }

    @Override
    @Transactional
    public String markAsResolved(Long reviewId) {
        ProductReviews review = productReviewsRepository.findRootReviewById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found or is deleted"));

        if (review.getProcessStatus() == ReviewStatus.PENDING) {
            review.setProcessStatus(ReviewStatus.RESOLVED);
            productReviewsRepository.save(review);
        } else {
            return "Review #" + reviewId + " already resolved or replied.";
        }

        return "Review #" + reviewId + " has been marked as resolved.";
    }

    @Override
    @Transactional
    public String deleteReplyByPM(Long replyId) {
        Long userId = getUserIdFromToken();

        Users users = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        ProductReviews reply = productReviewsRepository.findByReviewId(replyId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        checkOwnershipOrAdmin(users, reply.getUser());

        ProductReviews parentReview = productReviewsRepository.findRootReviewById(reply.getParentId())
                .orElseThrow(() -> new NotFoundException("Parent review not found"));
        parentReview.setProcessStatus(ReviewStatus.PENDING);

        productReviewsRepository.delete(reply);
        productReviewsRepository.save(parentReview);
        return "Delete reply successfully!";
    }

    @Override
    @Transactional
    public String forceDeleteCustomerReview(Long reviewId) {
        ProductReviews review = productReviewsRepository.findRootReviewById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found or is deleted"));

        List<ProductReviews> replies = productReviewsRepository.findRepliesByParentIds(List.of(review.getId()));

        review.setIsDeleted(true);
        review.setProcessStatus(ReviewStatus.RESOLVED);
        replies.forEach(r -> r.setIsDeleted(true));

        return "Customer review #" + reviewId + " and its replies have been marked as deleted.";
    }

    //Helper
    private void checkOwnershipOrAdmin(Users currentUsers, Users ownerUsers) {
        if (currentUsers.getRole() == Role.ADMIN) {
            return;
        }

        if (currentUsers != ownerUsers) {
            throw new ForbiddenException("You can only delete your own reply");
        }
    }

    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
    }

    private ReviewManagerResponseDTO toCommentDTO(ProductReviews review, List<ProductReviewReplyDTO> replies) {
        return ReviewManagerResponseDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getTitle())
                .userId(review.getUser().getId())
                .userName(reviewHelperService.resolveDisplayName(review.getUser()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .reviewStatusCode(review.getProcessStatus().getCode())
                .reviewStatus(review.getProcessStatus())
                .isDeleted(review.getIsDeleted())
                .replies(replies == null ? Collections.emptyList() : replies)
                .build();
    }

    private ProductReviewReplyDTO toReplyDTO(ProductReviews review) {
        return ProductReviewReplyDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(reviewHelperService.resolveDisplayName(review.getUser()))
                .userRole(review.getUser().getRole().toString())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
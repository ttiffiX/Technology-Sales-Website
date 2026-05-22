package com.example.sale_tech_web.feature.product_reviews.manager.customer;

import com.example.sale_tech_web.exception.ConflictException;
import com.example.sale_tech_web.exception.ForbiddenException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.UnauthorizedException;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewCommentDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewCreateRequest;
import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewStarsDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewUpdateRequest;
import com.example.sale_tech_web.feature.product_reviews.entity.ProductReviews;
import com.example.sale_tech_web.feature.product_reviews.enums.ReviewStatus;
import com.example.sale_tech_web.feature.product_reviews.manager.ProductReviewHelperService;
import com.example.sale_tech_web.feature.product_reviews.repository.ProductReviewsRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
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
public class ProductReviewsService implements ProductReviewsServiceInterface {
    private final ProductReviewsRepository productReviewsRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductReviewHelperService reviewHelperService;

    @Override
    public ProductReviewStarsDTO getProductStars(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new NotFoundException("Product not found");
        }

        long totalReviewCount = productReviewsRepository.countRootReviews(productId);
        double averageRating = productReviewsRepository.getAverageRating(productId);

        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (Object[] row : productReviewsRepository.countRootRatingsGrouped(productId)) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = ((Number) row[1]).longValue();
            ratingCounts.put(rating, count);
        }

        for (int i = 1; i <= 5; i++) {
            if (!ratingCounts.containsKey(i)) {
                ratingCounts.put(i, 0L);
            }
        }

        return ProductReviewStarsDTO.builder()
                .productId(productId)
                .totalReviewCount(totalReviewCount)
                .averageRating(averageRating)
                .ratingCounts(ratingCounts)
                .build();
    }

    @Override
    public Page<ProductReviewCommentDTO> getProductComments(Long productId, Integer rating, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new NotFoundException("Product not found");
        }

        Page<ProductReviews> reviewPage = productReviewsRepository.findRootCommentsByProductId(productId, rating, pageable);
        List<Long> parentIds = reviewPage.getContent().stream()
                .map(ProductReviews::getId)
                .toList();

        Map<Long, List<ProductReviewReplyDTO>> repliesByParentId = reviewHelperService.loadRepliesByParentIds(parentIds);

        List<ProductReviewCommentDTO> content = reviewPage.getContent().stream()
                .map(review -> toCommentDTO(review, repliesByParentId.getOrDefault(review.getId(), Collections.emptyList())))
                .toList();

        return new PageImpl<>(content, pageable, reviewPage.getTotalElements());
    }

    @Override
    @Transactional
    public ProductReviewCommentDTO addReview(ProductReviewCreateRequest request) {
        Long userId = getUserIdFromToken();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (productReviewsRepository.existsByProductIdAndUserIdAndParentIdIsNull(product.getId(), user.getId())) {
            throw new ConflictException("You have already reviewed this product");
        }

        String comment = normalizeText(request.getComment());

        ProductReviews review = ProductReviews.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(comment)
                .parentId(null)
                .isDeleted(false)
                .processStatus(ReviewStatus.PENDING)
                .build();

        ProductReviews saved = productReviewsRepository.save(review);
        return toCommentDTO(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public ProductReviewCommentDTO updateReview(ProductReviewUpdateRequest request) {
        Long userId = getUserIdFromToken();

        ProductReviews review = productReviewsRepository.findRootReviewById(request.getReviewId())
                .orElseThrow(() -> new NotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own review");
        }

        if (review.getProcessStatus() != ReviewStatus.PENDING) {
            throw new ConflictException("You can no longer edit this review.");
        }

        if (!Objects.equals(review.getRating(), request.getRating())) {
            review.setRating(request.getRating());
        }

        if (request.getComment() != null && !request.getComment().isBlank()) {
            review.setComment(normalizeText(request.getComment()));
        }

        ProductReviews saved = productReviewsRepository.save(review);

        return toCommentDTO(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public String deleteReview(Long reviewId) {
        Long userId = getUserIdFromToken();

        ProductReviews review = productReviewsRepository.findRootReviewById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own review");
        }

        productReviewsRepository.delete(review);
        return "Review #" + reviewId + " deleted successfully";
    }

    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
    }

    private ProductReviewCommentDTO toCommentDTO(ProductReviews review, List<ProductReviewReplyDTO> replies) {
        return ProductReviewCommentDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(reviewHelperService.resolveDisplayName(review.getUser()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .replies(replies == null ? Collections.emptyList() : replies)
                .build();
    }


}

package com.example.sale_tech_web.controller.customer;

import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewCommentDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewCreateRequest;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewStarsDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.customer.ProductReviewUpdateRequest;
import com.example.sale_tech_web.feature.product_reviews.manager.customer.ProductReviewsServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product-reviews")
@Slf4j
public class ProductReviewsController {
    private final ProductReviewsServiceInterface productReviewsServiceInterface;

    @GetMapping("/{productId}/stars")
    public ResponseEntity<ProductReviewStarsDTO> getProductStar(@PathVariable Long productId) {
        log.info("Get review stats for product: {}", productId);
        return ResponseEntity.ok(productReviewsServiceInterface.getProductStars(productId));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Page<ProductReviewCommentDTO>> getProductComments(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Get comments for product: {}, rating filter: {}", productId, rating);
        return ResponseEntity.ok(productReviewsServiceInterface.getProductComments(productId, rating, pageable));
    }

    @PostMapping
    public ResponseEntity<ProductReviewCommentDTO> addReview(@Valid @RequestBody ProductReviewCreateRequest request) {
        log.info("Add review for product: {}", request.getProductId());
        return ResponseEntity.ok(productReviewsServiceInterface.addReview(request));
    }

    @PutMapping()
    public ResponseEntity<ProductReviewCommentDTO> updateReview(
            @Valid @RequestBody ProductReviewUpdateRequest request
    ) {
        log.info("Update review: {}", request.getReviewId());
        return ResponseEntity.ok(productReviewsServiceInterface.updateReview(request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        log.info("Delete review: {}", reviewId);
        return ResponseEntity.ok(productReviewsServiceInterface.deleteReview(reviewId));
    }
}


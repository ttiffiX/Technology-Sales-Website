package com.example.sale_tech_web.controller.pm;

import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReplyRequestDTO;
import com.example.sale_tech_web.feature.product_reviews.dto.pm.ReviewManagerResponseDTO;
import com.example.sale_tech_web.feature.product_reviews.manager.pm.PRManagerServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/product-reviews")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class PRManagerController {
    private final PRManagerServiceInterface prManagerService;

    @GetMapping
    public ResponseEntity<Page<ReviewManagerResponseDTO>> getAllReviews(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer star,
            @RequestParam(required = false) Integer status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("Get all reviews for manager with params:  keyword: {}, star: {}, status: {}, pageable: {}", keyword, star, status, pageable);
        Page<ReviewManagerResponseDTO> response = prManagerService.getAllReviewsForManager(
                keyword, star, status, pageable
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reviewId}")
    public ResponseEntity<ProductReviewReplyDTO> addReply(
            @PathVariable Long reviewId,
            @RequestBody ReplyRequestDTO request) {
        log.info("Add reply to review (id {})", reviewId);
        ProductReviewReplyDTO response = prManagerService.addReplyFromPM(reviewId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reply/{replyId}")
    public ResponseEntity<ProductReviewReplyDTO> updateReply(
            @PathVariable Long replyId,
            @RequestBody ReplyRequestDTO request) {
        log.info("Update reply (id {})", replyId);
        ProductReviewReplyDTO response = prManagerService.updateReplyByPM(replyId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<String> markAsResolved(@PathVariable Long reviewId) {
        log.info("Mark review (id {}) as resolved", reviewId);
        String message = prManagerService.markAsResolved(reviewId);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/reply/{replyId}")
    public ResponseEntity<String> deleteReply(@PathVariable Long replyId) {
        log.info("Delete reply (id {})", replyId);
        String message = prManagerService.deleteReplyByPM(replyId);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{reviewId}/force")
    public ResponseEntity<String> forceDeleteCustomerReview(@PathVariable Long reviewId) {
        log.warn("Force delete review with ID: {}", reviewId);
        String message = prManagerService.forceDeleteCustomerReview(reviewId);
        return ResponseEntity.ok(message);
    }
}


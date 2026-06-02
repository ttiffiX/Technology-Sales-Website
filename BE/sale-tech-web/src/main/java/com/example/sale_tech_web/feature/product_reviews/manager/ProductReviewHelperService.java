package com.example.sale_tech_web.feature.product_reviews.manager;


import com.example.sale_tech_web.feature.product_reviews.dto.ProductReviewReplyDTO;
import com.example.sale_tech_web.feature.product_reviews.entity.ProductReviews;
import com.example.sale_tech_web.feature.product_reviews.repository.ProductReviewsRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductReviewHelperService {
    private final ProductReviewsRepository productReviewsRepository;

    public Map<Long, List<ProductReviewReplyDTO>> loadRepliesByParentIds(List<Long> parentIds, Boolean isPM) {
        if (parentIds == null || parentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<ProductReviews> replies;
        if (isPM) {
            replies = productReviewsRepository.findRepliesByParentIdsPM(parentIds);
        } else {
            replies = productReviewsRepository.findRepliesByParentIds(parentIds);
        }
        Map<Long, List<ProductReviewReplyDTO>> result = new HashMap<>();

        for (ProductReviews reply : replies) {
            if (reply.getParentId() == null) {
                continue;
            }
            result.computeIfAbsent(reply.getParentId(), _ -> new ArrayList<>()).add(toReplyDTO(reply));
        }
        return result;
    }

    private ProductReviewReplyDTO toReplyDTO(ProductReviews review) {
        return ProductReviewReplyDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(resolveDisplayName(review.getUser()))
                .userRole(review.getUser().getRole() != null ? review.getUser().getRole().name() : null)
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public String resolveDisplayName(Users user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmail();
    }
}

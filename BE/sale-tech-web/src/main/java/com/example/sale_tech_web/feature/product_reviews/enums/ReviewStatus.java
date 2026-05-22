package com.example.sale_tech_web.feature.product_reviews.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ReviewStatus {
    PENDING(0),
    REPLIED(1),
    RESOLVED(2);

    private final int code;

    public static ReviewStatus fromCode(int code) {
        for (ReviewStatus status : values()) {
            if (status.getCode() == code) {
                return status;
            }
        }
        return null;
    }
}

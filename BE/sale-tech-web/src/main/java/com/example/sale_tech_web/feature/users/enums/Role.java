package com.example.sale_tech_web.feature.users.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    PM("pm"),
    ADMIN("admin"),
    CUSTOMER("customer");

    private final String value;
}

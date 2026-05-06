package com.example.sale_tech_web.feature.payment.enums;

import com.example.sale_tech_web.exception.BadRequestException;
import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.stream.Stream;

public enum PaymentMethod {
    VNPAY,
    CASH;


    @JsonCreator
    public static PaymentMethod fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null; // @NotNull ở Request sẽ xử lý tiếp
        }

        return Stream.of(PaymentMethod.values())
                .filter(method -> method.name().equals(value.trim().toUpperCase()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Payment method '" + value + "' is invalid."));
    }
}

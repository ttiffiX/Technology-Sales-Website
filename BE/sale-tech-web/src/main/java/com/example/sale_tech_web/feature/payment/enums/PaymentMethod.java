package com.example.sale_tech_web.feature.payment.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Stream;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

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
                .orElseThrow(() -> new ResponseStatusException(
                        BAD_REQUEST,
                        "Payment method '" + value + "' is invalid."
                ));
    }
}

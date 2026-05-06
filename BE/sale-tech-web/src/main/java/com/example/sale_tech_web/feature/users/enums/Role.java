package com.example.sale_tech_web.feature.users.enums;

import com.example.sale_tech_web.exception.NotFoundException;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    PM,
    ADMIN,
    USER;

    @JsonCreator
    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new NotFoundException("Role " + value + " not found.");
    }
}

package com.example.sale_tech_web.feature.users.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Role " + value + " not found.");
    }
}

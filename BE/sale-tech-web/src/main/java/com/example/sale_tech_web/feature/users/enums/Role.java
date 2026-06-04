package com.example.sale_tech_web.feature.users.enums;

import com.example.sale_tech_web.exception.NotFoundException;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@RequiredArgsConstructor
public enum Role {
    USER(0),
    PM(1),
    ADMIN(2);

    private final int value;

    @JsonCreator
    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new NotFoundException("Role " + value + " not found.");
    }

    public static Role fromValue(int value) {
        for (Role role : Role.values()) {
            if (role.getValue() == value) {
                return role;
            }
        }
        throw new NotFoundException("Role with value " + value + " not found.");
    }

    /**
     * Lấy tất cả các Role có cấp bậc LỚN HƠN HOẶC BẰNG Role hiện tại.
     * Thường dùng cho: Hệ thống Thông báo (Cấp trên nhận được thông báo của cấp dưới).
     * Ví dụ: getRolesGreaterThanOrEqual(Role.PM) -> Trả về [PM, ADMIN]
     */
    public static List<Role> getRolesGreaterThanOrEqual(Role targetRole) {
        List<Role> roles = new ArrayList<>();
        if (targetRole == null) return roles;

        for (Role r : Role.values()) {
            if (r.getValue() >= targetRole.getValue()) {
                roles.add(r);
            }
        }
        return roles;
    }

    /**
     * Lấy tất cả các Role có cấp bậc NHỎ HƠN HOẶC BẰNG Role hiện tại.
     * Thường dùng cho: Phân quyền quản trị (Cấp trên có quyền cấu hình/quản lý cấp dưới).
     * Ví dụ: getRolesLessThanOrEqual(Role.PM) -> Trả về [CUSTOMER, PM]
     */
    public static List<Role> getRolesLessThanOrEqual(Role targetRole) {
        List<Role> roles = new ArrayList<>();
        if (targetRole == null) return roles;

        for (Role r : Role.values()) {
            if (r.getValue() <= targetRole.getValue()) {
                roles.add(r);
            }
        }
        return roles;
    }
}

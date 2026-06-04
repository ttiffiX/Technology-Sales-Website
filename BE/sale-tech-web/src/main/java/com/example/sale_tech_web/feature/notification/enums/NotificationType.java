package com.example.sale_tech_web.feature.notification.enums;

import com.example.sale_tech_web.feature.users.enums.Role;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {
    NEW_ORDER(0, Role.PM),
    NEW_REVIEW(1, Role.PM);

    private final Integer code;
    private final Role targetRole;

}

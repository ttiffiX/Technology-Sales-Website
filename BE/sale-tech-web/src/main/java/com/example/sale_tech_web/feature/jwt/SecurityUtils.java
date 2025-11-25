package com.example.sale_tech_web.feature.jwt;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility class để lấy thông tin user hiện tại từ Security Context
 * Security Context được set bởi AuthTokenFilter sau khi parse JWT token
 */
@Component
public class SecurityUtils {

    /**
     * Lấy userId của user hiện tại từ JWT token
     * @return userId hoặc null nếu chưa login
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
            && authentication.getPrincipal() != null
            && !authentication.getName().equals("anonymousUser")) {
            try {
                // AuthTokenFilter lưu userId vào principal
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Check xem user đã login chưa
     * @return true nếu đã authenticated
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
            && authentication.isAuthenticated()
            && !authentication.getName().equals("anonymousUser");
    }

    /**
     * Lấy Authentication object
     * @return Authentication hoặc null
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}


package com.example.sale_tech_web.controller;
import com.example.sale_tech_web.feature.email.dto.VerifyOtpRequest;
import com.example.sale_tech_web.feature.jwt.dto.RefreshTokenResponse;
import com.example.sale_tech_web.feature.jwt.manager.RefreshTokenService;
import com.example.sale_tech_web.feature.users.dto.*;
import com.example.sale_tech_web.feature.users.manager.UserServiceInterface;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserServiceInterface userServiceInterface;
    private final RefreshTokenService refreshTokenService;

    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExp;

    @PostMapping("/login")
    public ResponseEntity<LogInResponse> login(
            @RequestBody LogInRequest logInRequest,
            HttpServletResponse response) {

        log.info("Login attempt for user: {}", logInRequest.getUsernameOrEmail());
        LogInResponse loginResponse = userServiceInterface.login(logInRequest);

        // Set refresh token vào HttpOnly Cookie
        Cookie refreshCookie = buildRefreshCookie(loginResponse.getRefreshToken(), (int) (jwtRefreshExp / 1000));
        response.addCookie(refreshCookie);

        // Xóa refreshToken khỏi response body (không cần gửi lên FE)
        loginResponse.setRefreshToken(null);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {

        log.info("Refresh token request");
        String refreshTokenValue = extractRefreshTokenFromCookie(request);

        String newAccessToken = refreshTokenService.refreshAccessToken(refreshTokenValue);

        // Rotate cookie: gia hạn lại thời gian
        Cookie refreshCookie = buildRefreshCookie(refreshTokenValue, (int) (jwtRefreshExp / 1000));
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        log.info("Logout request");
        try {
            String refreshTokenValue = extractRefreshTokenFromCookie(request);
            refreshTokenService.revokeRefreshToken(refreshTokenValue);
        } catch (Exception ignored) {
            // Cookie không tồn tại hoặc đã hết hạn, vẫn tiếp tục clear
        }

        // Xóa cookie bằng cách set maxAge = 0
        Cookie clearCookie = buildRefreshCookie("", 0);
        response.addCookie(clearCookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Register attempt for user: {}", registerRequest.getUsername());
        String response = userServiceInterface.createUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePassRequest changePassRequest) {
        log.info("Password change attempt");
        String response = userServiceInterface.changePassword(changePassRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyOtpRequest request) {
        log.info("OTP verification attempt for email: {}", request.getEmail());
        return ResponseEntity.ok(userServiceInterface.verifyEmail(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestParam String email) {
        log.info("Resend verification email request for: {}", email);
        return ResponseEntity.ok(userServiceInterface.resendVerificationEmail(email));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        log.info("Forgot password request for: {}", email);
        return ResponseEntity.ok(userServiceInterface.forgotPassword(email));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<VerifyResetOtpResponse> verifyResetOtp(@RequestBody VerifyOtpRequest request) {
        log.info("Verify reset OTP for email: {}", request.getEmail());
        return ResponseEntity.ok(userServiceInterface.verifyResetOtp(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestHeader("X-Reset-Token") String resetToken,
            @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request");
        return ResponseEntity.ok(userServiceInterface.resetPassword(
                resetToken,
                request.getNewPassword(),
                request.getConfirmPassword()
        ));
    }

    // Helper methods

    private Cookie buildRefreshCookie(String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie("refreshToken", value);
        cookie.setHttpOnly(true);
        // cookie.setSecure(true); // Bật khi deploy HTTPS
        cookie.setPath("/auth");
        cookie.setMaxAge(maxAgeSeconds);
        return cookie;
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token cookie found");
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token cookie not found"));
    }
}

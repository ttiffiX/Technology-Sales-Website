package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.users.dto.ChangePassRequest;
import com.example.sale_tech_web.feature.users.dto.LogInRequest;
import com.example.sale_tech_web.feature.users.dto.RegisterRequest;
import com.example.sale_tech_web.feature.users.dto.LogInResponse;
import com.example.sale_tech_web.feature.users.manager.UserServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final UserServiceInterface userServiceInterface;

    @PostMapping("/login")
    public ResponseEntity<LogInResponse> login(@RequestBody LogInRequest logInRequest) {
        log.info("Login attempt for user: {}", logInRequest.getUsername());
        LogInResponse response = userServiceInterface.login(logInRequest);
        return ResponseEntity.ok(response);
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

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        log.info("Email verification attempt with token: {}", token);
        String response = userServiceInterface.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestParam String email) {
        log.info("Resend verification email request for: {}", email);
        String response = userServiceInterface.resendVerificationEmail(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        log.info("Forgot password request for: {}", email);
        String response = userServiceInterface.forgotPassword(email);
        return ResponseEntity.ok(response);
    }
}


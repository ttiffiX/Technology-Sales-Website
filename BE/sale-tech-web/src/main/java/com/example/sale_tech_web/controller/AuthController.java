package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.users.dto.LogInRequest;
import com.example.sale_tech_web.feature.users.dto.RegisterRequest;
import com.example.sale_tech_web.feature.users.dto.LogInResponse;
import com.example.sale_tech_web.feature.users.manager.UserServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserServiceInterface userServiceInterface;

    @PostMapping("/login")
    public ResponseEntity<LogInResponse> login(@RequestBody LogInRequest logInRequest) {
        LogInResponse response = userServiceInterface.login(logInRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        String response = userServiceInterface.createUser(registerRequest);
        return ResponseEntity.ok(response);
    }
}


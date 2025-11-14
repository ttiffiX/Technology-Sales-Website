package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.controller.request.LogInRequest;
import com.example.sale_tech_web.controller.request.RegisterRequest;
import com.example.sale_tech_web.controller.response.LogInResponse;
import com.example.sale_tech_web.feature.users.manager.UserService;
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
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LogInResponse> login(@RequestBody LogInRequest logInRequest) {
        LogInResponse response = userService.login(logInRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        String response = userService.createUser(registerRequest);
        return ResponseEntity.ok(response);
    }
}


package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.controller.request.LogInRequest;
import com.example.sale_tech_web.controller.request.RegisterRequest;
import com.example.sale_tech_web.feature.customer.manager.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LogInRequest logInRequest) {
        String response = customerService.login(logInRequest.getUsername(), logInRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        String response = customerService.register(registerRequest.getUsername(), registerRequest.getPassword(), registerRequest.getEmail());
        return ResponseEntity.ok(response);
    }
}


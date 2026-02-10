package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.profile.dto.ProfileResponse;
import com.example.sale_tech_web.feature.profile.dto.ProfileRequest;
import com.example.sale_tech_web.feature.profile.manager.ProfileServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {
    private final ProfileServiceInterface profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        log.info("Get current user profile");
        ProfileResponse response = profileService.getProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileRequest request) {
        log.info("Update current user profile");
        ProfileResponse response = profileService.updateProfile(request);
        return ResponseEntity.ok(response);
    }
}


package com.example.sale_tech_web.feature.profile.manager;

import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.profile.dto.ProfileResponse;
import com.example.sale_tech_web.feature.profile.dto.ProfileRequest;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class ProfileService implements ProfileServiceInterface {
    private final UserRepository userRepository;

    @Override
    public ProfileResponse getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        return convertToResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(ProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        // Cập nhật thông tin user
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        return convertToResponse(user);
    }

    private ProfileResponse convertToResponse(Users user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .build();
    }
}

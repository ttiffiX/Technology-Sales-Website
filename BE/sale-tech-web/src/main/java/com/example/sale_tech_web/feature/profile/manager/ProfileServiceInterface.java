package com.example.sale_tech_web.feature.profile.manager;

import com.example.sale_tech_web.feature.profile.dto.ProfileResponse;
import com.example.sale_tech_web.feature.profile.dto.ProfileRequest;

public interface ProfileServiceInterface {
    ProfileResponse getProfile();

    ProfileResponse updateProfile(ProfileRequest request);
}

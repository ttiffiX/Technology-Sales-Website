package com.example.sale_tech_web.feature.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String phone;
}


package com.example.sale_tech_web.feature.users.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminPasswordRequest {
    @NotBlank(message = "Admin password must not be blank")
    String adminPassword;
}

package com.example.sale_tech_web.feature.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    private String resetToken;

    @NotBlank(message = "New Password is required")
    @Size(min = 8, message = "New Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "New Password must contain at least one digit, one lowercase, one uppercase, and one special character."
    )
    private String newPassword;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;
}

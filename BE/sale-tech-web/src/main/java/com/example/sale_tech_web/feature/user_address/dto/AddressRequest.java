package com.example.sale_tech_web.feature.user_address.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class AddressRequest {
    @NotBlank(message = "Province code is required")
    private String provinceCode;

    @NotBlank(message = "Ward code is required")
    private String wardCode;

    @NotBlank(message = "Address is required")
    private String address;

    private Boolean isDefault;

    private String label; // e.g., "Home", "Office"
}


package com.example.sale_tech_web.feature.user_address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class AddressResponse {
    private Long id;
    private String provinceCode;
    private String provinceName;
    private String wardCode;
    private String wardName;
    private String address;
    private boolean isDefault;
    private String label;
}


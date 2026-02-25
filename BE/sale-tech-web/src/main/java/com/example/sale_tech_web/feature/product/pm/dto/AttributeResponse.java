package com.example.sale_tech_web.feature.product.pm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class AttributeResponse {
    private Long attributeId;
    private String name;
    private String unit;
    private String dataType;
}

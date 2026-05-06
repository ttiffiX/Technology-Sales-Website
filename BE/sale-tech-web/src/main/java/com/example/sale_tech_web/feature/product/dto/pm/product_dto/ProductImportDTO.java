package com.example.sale_tech_web.feature.product.dto.pm.product_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImportDTO {
    private String title;
    private String description;
    private Integer price;
    private Integer quantity;
    private Boolean isActive;
    private String imageUrl;

    private Map<String, Object> attributes;
}

package com.example.sale_tech_web.feature.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDTO {
    private Long id;
    private String title;
    private String description;
    private Integer price;
    private Integer quantitySold;
    private String imageUrl;
    private Boolean stocked;

    // Category info
    private Long categoryId;
    private String categoryName;

    // Attributes as map: attributeName -> value
    private Map<String, String> attributes;
}


package com.example.sale_tech_web.feature.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListDTO {
    private Long id;
    private String title;
    private Integer price;
    private Integer quantitySold;
    private String imageUrl;
    private Boolean stocked;
    private String categoryName;
}


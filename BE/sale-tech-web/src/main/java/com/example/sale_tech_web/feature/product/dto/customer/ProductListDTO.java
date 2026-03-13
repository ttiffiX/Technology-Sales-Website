package com.example.sale_tech_web.feature.product.dto.customer;

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
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
}

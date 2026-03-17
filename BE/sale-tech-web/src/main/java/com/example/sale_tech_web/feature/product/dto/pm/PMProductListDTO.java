package com.example.sale_tech_web.feature.product.dto.pm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PMProductListDTO {
    private Long id;
    private String title;
    private Integer price;
    private Boolean isActive;
    private Long categoryId;
    private String categoryName;
}

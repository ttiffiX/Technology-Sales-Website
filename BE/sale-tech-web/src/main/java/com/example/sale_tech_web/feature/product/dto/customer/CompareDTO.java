package com.example.sale_tech_web.feature.product.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompareDTO {
    private Long id;
    private String title;
    private Integer price;
    private String imageUrl;
    private String categoryName;

    private Map<String, Object> rawAttributes;
}

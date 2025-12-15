package com.example.sale_tech_web.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetailDTO {
    private Long id;
    private String productTitle;
    private String categoryName;
    private Integer quantity;
    private Integer price;
}

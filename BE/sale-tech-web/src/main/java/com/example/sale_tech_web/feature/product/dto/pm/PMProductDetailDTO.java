package com.example.sale_tech_web.feature.product.dto.pm;

import com.example.sale_tech_web.feature.product.dto.customer.ProductFilterGroupDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PMProductDetailDTO {
    private Long id;
    private String title;
    private String description;
    private Integer price;
    private Integer quantity;
    private Integer quantitySold;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Map<Integer, ProductFilterGroupDTO> attributes;
}


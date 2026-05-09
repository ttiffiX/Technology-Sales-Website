package com.example.sale_tech_web.feature.product.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategoryListDTO {
    Long categoryId;
    String categoryName;
    List<ProductListDTO> productList;
}

package com.example.sale_tech_web.feature.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompareResponse {
    private List<String> attributeNames;
    // Danh sách sản phẩm được so sánh (tối đa 3)
    private List<ProductDetailDTO> products;
}

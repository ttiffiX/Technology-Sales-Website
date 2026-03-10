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
public class CompareResponse {
    private List<AttributeValueDTO> attributeNames;
    // Danh sách sản phẩm được so sánh (tối đa 3)
    private List<CompareDTO> products;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttributeValueDTO {
        private String code;
        private String attributeName;
    }
}

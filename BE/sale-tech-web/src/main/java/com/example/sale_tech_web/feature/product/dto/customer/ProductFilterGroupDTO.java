package com.example.sale_tech_web.feature.product.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductFilterGroupDTO {
    private String groupName;
    private List<AttributeDTO> filterAttributes;

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class AttributeDTO {
        private String attributeName;
        private String unit;
        private Object availableValues;
    }
}

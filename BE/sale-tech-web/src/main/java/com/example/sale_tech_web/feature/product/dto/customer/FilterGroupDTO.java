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
public class FilterGroupDTO {
    private String groupName;
    private List<FilterAttributeDTO> filterAttributes;

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class FilterAttributeDTO {
        private String code;
        private String attributeName;
        private String unit;
        private List<String> availableValues;
    }
}

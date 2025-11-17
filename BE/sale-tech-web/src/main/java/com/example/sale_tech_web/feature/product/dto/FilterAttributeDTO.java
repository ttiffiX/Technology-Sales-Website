package com.example.sale_tech_web.feature.product.dto;

import java.util.List;

import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;

//          DTO for a single filterable attribute
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FilterAttributeDTO {
    private Long attributeId;
    private String attributeName;
    private String unit;
    private List<String> availableValues; // Các giá trị có sẵn để filter
}








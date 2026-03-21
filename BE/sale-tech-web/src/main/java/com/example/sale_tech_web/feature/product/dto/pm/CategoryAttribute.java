package com.example.sale_tech_web.feature.product.dto.pm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoryAttribute {
    private Long attributeId;
    private String code;
    private String name;
    private String unit;
    private String dataType;
    private Boolean isFilterable;
    private String groupName;
    private Integer groupOrder;
    private Integer displayOrder;
}

package com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeGroupDTO {
    private Long id;
    private Long categoryId;
    private String name;
    private Integer groupOrder;
}

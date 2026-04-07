package com.example.sale_tech_web.feature.product.dto.pm.attribute_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoryAttributeResponse {
    private Long groupId;
    private String groupName;
    private Integer groupOrder;
    List<CategoryAttribute> categoryAttributeList;
}

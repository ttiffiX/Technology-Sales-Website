package com.example.sale_tech_web.feature.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO chứa tất cả filter options cho một category
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryFilterOptionsDTO {
    private Long categoryId;
    private String categoryName;
    private List<FilterAttributeDTO> filterableAttributes;
}


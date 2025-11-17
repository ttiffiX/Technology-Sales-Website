package com.example.sale_tech_web.feature.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for advanced filtering
 * Example:
 * {
 *   "categoryId": 1,
 *   "minPrice": 10000000,
 *   "maxPrice": 30000000,
 *   "attributeFilters": {
 *     "1": ["8", "16"],    // attributeId 1 (RAM): values 8GB or 16GB
 *     "3": ["15.6"]        // attributeId 3 (Screen): value 15.6 inch
 *   }
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvancedFilterRequest {
    private Long categoryId;
    private Integer minPrice;
    private Integer maxPrice;

    /**
     * Map of attributeId -> list of values
     * Example: {1: ["8", "16"], 3: ["15.6"]}
     */
    private Map<Long, List<String>> attributeFilters;
}


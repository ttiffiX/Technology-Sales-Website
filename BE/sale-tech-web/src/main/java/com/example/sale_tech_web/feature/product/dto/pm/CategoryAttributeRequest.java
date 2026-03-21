package com.example.sale_tech_web.feature.product.dto.pm;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoryAttributeRequest {
    @NotBlank(message = "Attribute code is required")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "Code must be lowercase, numbers or underscore only")
    @Size(max = 50, message = "Code is too long")
    private String code;

    @NotBlank(message = "Display name is required")
    @Size(max = 100, message = "Name is too long")
    private String name;

    private String unit;

    @NotBlank(message = "Data type is required")
    @Pattern(regexp = "^(Text|Number|Boolean|List)$",
            message = "DataType must be Text, Number, Boolean, or List")
    private String dataType;

    @NotNull(message = "isFilterable status is required")
    private Boolean isFilterable;

    @NotBlank(message = "Group name is required")
    @Size(max = 50, message = "Group name is too long")
    private String groupName;

    @Min(value = 1, message = "Group Order must be >= 1")
    private Integer groupOrder;

    @Min(value = 1, message = "Display Order must be >= 1")
    private Integer displayOrder;
}

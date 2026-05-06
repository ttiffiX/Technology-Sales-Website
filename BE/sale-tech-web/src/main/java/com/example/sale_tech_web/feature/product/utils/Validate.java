package com.example.sale_tech_web.feature.product.utils;

import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Validate {
    public static void validateProductAttributes(List<CategoryAttributeSchema> schemas, Map<String, Object> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            throw new BadRequestException("Attributes are required");
        }

        Map<String, CategoryAttributeSchema> schemaByCode = schemas.stream()
                .collect(Collectors.toMap(
                        s -> s.getCode().trim().toLowerCase(),
                        s -> s,
                        (first, ignored) -> first
                ));

        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            String rawCode = entry.getKey();
            Object rawValue = entry.getValue();

            if (rawCode == null || rawCode.isBlank()) {
                throw new BadRequestException("Attribute code must not be blank");
            }

            String normalizedCode = rawCode.trim().toLowerCase();
            CategoryAttributeSchema schema = schemaByCode.get(normalizedCode);
            if (schema == null) {
                throw new BadRequestException(
                        "Unknown attribute code '" + rawCode + "'. No schema defined for this code in category.");
            }

            if (rawValue == null) {
                throw new BadRequestException(
                        "Attribute '" + rawCode + "' must not be null");
            }

            String dataType = schema.getDataType() == null ? "" : schema.getDataType().trim().toLowerCase();
            switch (dataType) {
                case "number" -> {
                    if (!(rawValue instanceof Number)) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be NUMBER");
                    }
                }
                case "boolean" -> {
                    if (!(rawValue instanceof Boolean)) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be BOOLEAN");
                    }
                }
                case "text" -> {
                    if (rawValue instanceof String) {
                        continue;
                    }

                    boolean isStringList = rawValue instanceof List<?> list
                            && list.stream().allMatch(item -> item instanceof String);

                    if (!isStringList) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be TEXT or list of TEXT");
                    }
                }
                case "list" -> {
                    if (!(rawValue instanceof List<?>)) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be LIST");
                    }
                }
                default -> throw new BadRequestException(
                        "Unsupported dataType '" + schema.getDataType() + "' for attribute '" + rawCode + "'");
            }
        }
    }
}

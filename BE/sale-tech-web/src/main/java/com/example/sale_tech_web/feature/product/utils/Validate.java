package com.example.sale_tech_web.feature.product.utils;

import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Validate {
    public static Map<String, Object> validateProductAttributes(List<CategoryAttributeSchema> schemas, Map<String, Object> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            throw new BadRequestException("Attributes are required");
        }

        Map<String, CategoryAttributeSchema> schemaByCode = schemas.stream()
                .collect(Collectors.toMap(
                        s -> s.getCode().trim().toLowerCase(),
                        s -> s,
                        (first, ignored) -> first
                ));

        Map<String, Object> validatedAttributes = new HashMap<>();

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
            Object processedValue;

            switch (dataType) {
                case "number" -> {
                    if (!(rawValue instanceof Number)) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be NUMBER");
                    }
                    processedValue = rawValue;
                }
                case "boolean" -> {
                    if (!(rawValue instanceof Boolean)) {
                        throw new BadRequestException(
                                "Attribute '" + rawCode + "' must be BOOLEAN");
                    }
                    processedValue = rawValue;
                }
                case "text" -> {
                    processedValue = String.valueOf(rawValue);
                }
                case "list" -> {
                    List<String> resultList = new ArrayList<>();

                    if (rawValue instanceof List<?> list) {
                        // Trường hợp 1: Đã là List (thường từ JSON gửi xuống)
                        list.forEach(item -> resultList.add(String.valueOf(item).trim()));
                    } else if (rawValue instanceof String str) {
                        // Trường hợp 2: Là String dạng "Bluetooth, USB" (thường từ Excel)
                        if (str.contains(",")) {
                            String[] parts = str.split(",");
                            for (String part : parts) {
                                if (!part.isBlank()) {
                                    resultList.add(part.trim());
                                }
                            }
                        } else if (!str.isBlank()) {
                            // Là String đơn lẻ "Bluetooth"
                            resultList.add(str.trim());
                        }
                    } else {
                        // Trường hợp 3: Là số hoặc kiểu khác -> Coi là 1 phần tử của List
                        resultList.add(String.valueOf(rawValue).trim());
                    }

                    // Kiểm tra nếu sau khi xử lý mà List vẫn rỗng
                    if (resultList.isEmpty()) {
                        throw new BadRequestException("Attribute '" + rawCode + "' (LIST) cannot be empty");
                    }
                    processedValue = resultList;
                }
                default -> throw new BadRequestException(
                        "Unsupported dataType '" + schema.getDataType() + "' for attribute '" + rawCode + "'");
            }
            validatedAttributes.put(normalizedCode, processedValue);
        }
        return validatedAttributes;
    }
}

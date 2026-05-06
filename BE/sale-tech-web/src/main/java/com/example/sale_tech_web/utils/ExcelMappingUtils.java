package com.example.sale_tech_web.utils;

import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductImportDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExcelMappingUtils {

    private static final List<String> CORE_FIELDS =
            List.of("title", "description", "price", "quantity", "is_active", "image_url");

    public static ProductImportDTO mapToDTO(Map<Integer, Object> rowData, Map<Integer, String> headMap) {
        Map<String, Object> attributes = new HashMap<>();
        Map<String, Object> coreDataMap = new HashMap<>();

        rowData.forEach((index, value) -> {
            String columnName = headMap.get(index);
            if (columnName != null) {
                String normalizedName = columnName.trim().toLowerCase();

                // Xử lý giá trị: Nếu là số thì chuẩn hóa về Number
                Object processedValue = tryParseNumber(value);

                if (CORE_FIELDS.contains(normalizedName)) {
                    coreDataMap.put(normalizedName, processedValue);
                } else {
                    if (processedValue != null) {
                        attributes.put(columnName.trim(), processedValue);
                    }
                }
            }
        });

        return ProductImportDTO.builder()
                .title(getString(coreDataMap.get("title")))
                .description(getString(coreDataMap.get("description")))
                .price(getInt(coreDataMap.get("price")))
                .quantity(getInt(coreDataMap.get("quantity")))
                .isActive(getBool(coreDataMap.get("is_active")))
                .imageUrl(getString(coreDataMap.get("image_url")))
                .attributes(attributes)
                .build();
    }

    private static Object tryParseNumber(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return value; // Đã là số thì giữ nguyên

        try {
            // Xử lý trường hợp chuỗi "1,65" thành "1.65" để Double parse được
            String strValue = String.valueOf(value).replace(",", ".");
            return refineNumber(Double.parseDouble(strValue));
        } catch (NumberFormatException e) {
            // Nếu không phải số (ví dụ: "Windows 11") thì trả về String ban đầu
            return value;
        }
    }

    /**
     * Hàm hỗ trợ để loại bỏ phần .0 thừa thãi
     */
    private static Object refineNumber(Number number) {
        double dblValue = number.doubleValue();

        if (dblValue == Math.floor(dblValue) && !Double.isInfinite(dblValue)) {
            return (int) dblValue;
        }

        return dblValue;
    }

    private static String getString(Object obj) {
        return obj != null ? String.valueOf(obj) : "";
    }

    private static Integer getInt(Object obj) {
        if (obj == null) return 0;
        try {
            return Double.valueOf(String.valueOf(obj)).intValue();
        } catch (Exception e) {
            return 0;
        }
    }

    private static Boolean getBool(Object obj) {
        if (obj == null) return true;
        String val = String.valueOf(obj).toLowerCase();
        return val.equals("true") || val.equals("1");
    }
}
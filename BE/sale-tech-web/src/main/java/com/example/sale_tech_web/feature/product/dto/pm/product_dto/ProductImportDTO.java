package com.example.sale_tech_web.feature.product.dto.pm.product_dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class ProductImportDTO {
    @ExcelProperty("title")
    private String title;

    @ExcelProperty("description")
    private String description;

    @ExcelProperty("price")
    private Integer price;

    @ExcelProperty("quantity")
    private Integer quantity;

    @ExcelProperty("is_active")
    private Boolean isActive;

    @ExcelProperty("image_url")
    private String imageUrl;

    private Map<String, Object> attributes = new HashMap<>();
}

package com.example.sale_tech_web.feature.product.dto.customer;

public interface FilterProjection {
    String getCode();
    String getValues(); // Nhận chuỗi JSON từ jsonb_agg
}

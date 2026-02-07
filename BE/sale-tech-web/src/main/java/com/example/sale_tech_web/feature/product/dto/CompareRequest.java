package com.example.sale_tech_web.feature.product.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CompareRequest {
    Long categoryId;
    @Size(min = 2, max = 3, message = "Bạn cần chọn ít nhất 2 và tối đa 3 sản phẩm để so sánh")
    private List<Long> productIds;
}

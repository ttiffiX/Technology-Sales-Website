package com.example.sale_tech_web.feature.cart.entity;

import com.example.sale_tech_web.feature.product.dto.ProductListDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class CartDetailDTO {
    private Long cartDetailId;
    private ProductListDTO productList;
    private int quantity;
    private boolean isSelected; // Trạng thái checkbox
}

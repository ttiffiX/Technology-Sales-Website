package com.example.sale_tech_web.feature.cart.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class CartDTO {
    private Long cartId;
    private int totalQuantity;
    private int totalPrice;
    private List<CartDetailDTO> cartDetailDTO;
}

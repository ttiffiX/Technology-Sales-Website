package com.example.sale_tech_web.feature.cart.entity;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CartResponse {
    private int totalQuantity;
    private List<CartDTO> cartDTO;
}

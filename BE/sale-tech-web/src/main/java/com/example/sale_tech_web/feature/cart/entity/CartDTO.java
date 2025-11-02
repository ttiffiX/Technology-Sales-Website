package com.example.sale_tech_web.feature.cart.entity;

import lombok.Data;

@Data
public class CartDTO {
    private Long productId;
    private String category;
    private Long cartId;
    private String name;
    private Integer price;
    private int quantity;
    private String image;
}

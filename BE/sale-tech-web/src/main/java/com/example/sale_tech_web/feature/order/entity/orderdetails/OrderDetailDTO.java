package com.example.sale_tech_web.feature.order.entity.orderdetails;

import lombok.Data;

@Data
public class OrderDetailDTO {
    private Long orderDetailId;
//    private Long productId;
    private Long orderId;
    private String name;
    private Integer price;
    private int quantity;
    private String image;
}

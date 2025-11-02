package com.example.sale_tech_web.feature.order.entity;

import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private List<Order> orders;
    private List<OrderDetailDTO> orderDetails;
}

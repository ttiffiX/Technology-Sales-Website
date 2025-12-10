package com.example.sale_tech_web.feature.order.manager;

import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;

import java.util.List;

public interface OrderServiceInterface {
    List<OrderDTO> getOrderByUserId();

    List<OrderDetailDTO> getOrderDetailsByUserId();

    String placeOrder(PlaceOrderRequest request);

    String cancelOrder(Long orderId);

    List<OrderDTO> getOrdersByStatus(String status);
}


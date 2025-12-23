package com.example.sale_tech_web.feature.order.manager;

import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface OrderServiceInterface {
    List<OrderDTO> getOrderByUserId(String status);

    List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId);

    Object placeOrder(PlaceOrderRequest request, HttpServletRequest httpRequest);

    String cancelOrder(Long orderId);
}


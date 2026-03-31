package com.example.sale_tech_web.feature.order.manager.customer;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.customer.PlaceOrderRequest;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface OrderServiceInterface {
    List<OrderDTO> getOrderByUserId(String status);

    List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId);

    Object placeOrder(PlaceOrderRequest request, HttpServletRequest httpRequest);

    String cancelOrder(Long orderId, HttpServletRequest request);

    StatusCountDTO getOrderCountByStatus();
}


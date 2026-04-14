package com.example.sale_tech_web.feature.order.manager.customer;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.customer.PlaceOrderRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

import java.util.List;

public interface OrderServiceInterface {
    Page<OrderDTO> getOrderByUserId(String orderStatus,
                                    String paymentStatus,
                                    LocalDateTime startDate,
                                    LocalDateTime endDate,
                                    Pageable pageable);

    List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId);

    Object placeOrder(PlaceOrderRequest request, HttpServletRequest httpRequest);

    String cancelOrder(Long orderId, HttpServletRequest request);

    StatusCountDTO getOrderCountByStatus();
}


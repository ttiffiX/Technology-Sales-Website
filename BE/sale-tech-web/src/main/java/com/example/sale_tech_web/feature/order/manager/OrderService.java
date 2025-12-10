package com.example.sale_tech_web.feature.order.manager;

import com.example.sale_tech_web.controller.exception.ClientException;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderServiceInterface {
    private final OrderRepository orderRepository;

    @Override
    public List<OrderDTO> getOrderByUserId() {
        Long userId = getUserIdFromToken();

        List<Order> orders = orderRepository.findByUserId(userId)
                .orElseThrow(() -> new ClientException("Order not found"));

        List<OrderDTO> orderDTOs = new ArrayList<>();
        for (Order order : orders) {
            OrderDTO orderDTO = OrderDTO.builder()
                    .id(order.getId())
                    .customerName(order.getCustomerName())
                    .phone(order.getPhone())
                    .email(order.getEmail())
                    .address(order.getAddress())
                    .province(order.getProvince())
                    .deliveryFee(order.getDeliveryFee())
                    .totalPrice(order.getTotalPrice())
                    .createdAt(order.getCreatedAt())
                    .status(order.getStatus().name())
                    .build();

            orderDTOs.add(orderDTO);
        }
        return orderDTOs;
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByUserId() {
        return List.of();
    }

    @Override
    public String placeOrder(PlaceOrderRequest request) {
        return "";
    }

    @Override
    public String cancelOrder(Long orderId) {
        return "";
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(String status) {
        return List.of();
    }

    // -- Helper Method -- //
    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ClientException("User not authenticated");
        }
        return userId;
    }
}


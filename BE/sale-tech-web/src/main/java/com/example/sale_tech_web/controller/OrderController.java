package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.manager.OrderServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
@Slf4j
public class OrderController {
    private final OrderServiceInterface orderServiceInterface;

    /**
     * GET /orders - Get all orders for current user
     * GET /orders?status=PENDING - Filter orders by status (optional)
     * Valid status values: PENDING, APPROVED, REJECTED, CANCELLED, SUCCESS
     */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @RequestParam(required = false) String status
    ) {
        if (status != null && !status.trim().isEmpty()) {
            log.info("Get orders for current user with status: {}", status);
        } else {
            log.info("Get all orders for current user");
        }
        List<OrderDTO> orders = orderServiceInterface.getOrderByUserId(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /orders/{orderId}/details - Get order details (products) for a specific order
     * This is called when user clicks toggle to view order items
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetails(@PathVariable Long orderId) {
        log.info("Get order details for order ID: {}", orderId);
        List<OrderDetailDTO> orderDetails = orderServiceInterface.getOrderDetailsByOrderId(orderId);
        return ResponseEntity.ok(orderDetails);
    }

    @PostMapping
    public ResponseEntity<Object> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Place order - Customer: {}, Phone: {}, Payment: {}",
                request.getCustomerName(), request.getPhone(), request.getPaymentMethod());
        Object result = orderServiceInterface.placeOrder(request, httpRequest);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId) {
        log.info("Cancel order - Order ID: {}", orderId);
        String result = orderServiceInterface.cancelOrder(orderId);
        return ResponseEntity.ok(result);
    }
}


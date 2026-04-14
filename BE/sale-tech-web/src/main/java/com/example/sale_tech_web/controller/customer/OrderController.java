package com.example.sale_tech_web.controller.customer;

import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.customer.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.manager.customer.OrderServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
@Slf4j
public class OrderController {
    private final OrderServiceInterface orderServiceInterface;

    /**
     * GET /orders - Get paged orders for current user with optional filters.
     * Supported filters: orderStatus, paymentStatus, startDate, endDate.
     */
    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getMyOrders(
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Get orders for current user with filters - orderStatus: {}, paymentStatus: {}, startDate: {}, endDate: {}",
                orderStatus, paymentStatus, startDate, endDate);

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        Page<OrderDTO> orders = orderServiceInterface.getOrderByUserId(
                orderStatus,
                paymentStatus,
                startDateTime,
                endDateTime,
                pageable
        );
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

    @GetMapping("/status-count")
    public ResponseEntity<Object> getOrderCountByStatus() {
        log.info("Get order count by status for current user");
        Object result = orderServiceInterface.getOrderCountByStatus();
        return ResponseEntity.ok(result);
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
    public ResponseEntity<String> cancelOrder(
            @PathVariable Long orderId,
            HttpServletRequest request
    ) {
        log.info("Cancel order - Order ID: {}", orderId);
        String result = orderServiceInterface.cancelOrder(orderId, request);
        return ResponseEntity.ok(result);
    }
}


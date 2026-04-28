package com.example.sale_tech_web.controller.pm;

import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.manager.pm.OMServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/orders")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class OMController {
    private final OMServiceInterface omServiceInterface;

    @GetMapping()
    public ResponseEntity<Page<OrderDTO>> getOrdersForPM(
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("PM - Get all orders custom");

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;
        return ResponseEntity.ok(omServiceInterface.getAllOrderByStatus(orderStatus, paymentStatus, keyword, startDateTime, endDateTime, pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetails(@PathVariable Long orderId) {
        log.info("Get order details for order ID: {}", orderId);
        List<OrderDetailDTO> orderDetails = omServiceInterface.getOrderDetailsByOrderId(orderId);
        return ResponseEntity.ok(orderDetails);
    }

    @GetMapping("/status-count")
    public ResponseEntity<Object> getOrderCountByStatus() {
        log.info("PM - Get order count by status");
        return ResponseEntity.ok(omServiceInterface.getOrderCountByStatus());
    }

    @PatchMapping("/{orderId}/approve")
    public ResponseEntity<String> approveOrder(@PathVariable Long orderId) {
        log.info("PM - Approve order: id={}", orderId);
        return ResponseEntity.ok(omServiceInterface.approveOrder(orderId));
    }

    @PatchMapping("/{orderId}/reject")
    public ResponseEntity<String> rejectOrder(
            @PathVariable Long orderId,
            @RequestParam String reason,
            HttpServletRequest request) {
        log.info("PM - Reject order: id={}", orderId);
        return ResponseEntity.ok(omServiceInterface.rejectOrder(orderId, reason, request));
    }

    @PatchMapping("/{orderId}/shipping")
    public ResponseEntity<String> moveOrderToShipping(@PathVariable Long orderId) {
        log.info("PM - Move order to shipping: id={}", orderId);
        return ResponseEntity.ok(omServiceInterface.moveToShipping(orderId));
    }

    @PatchMapping("/{orderId}/complete")
    public ResponseEntity<String> completeOrder(@PathVariable Long orderId) {
        log.info("PM - Complete order: id={}", orderId);
        return ResponseEntity.ok(omServiceInterface.completeOrder(orderId));
    }
}

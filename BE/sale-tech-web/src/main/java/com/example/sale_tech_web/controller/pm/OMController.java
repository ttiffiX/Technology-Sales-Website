package com.example.sale_tech_web.controller.pm;

import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.manager.pm.OMServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/orders")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class OMController {
    private final OMServiceInterface omServiceInterface;

    @GetMapping()
    public ResponseEntity<List<OrderDTO>> getOrdersForPM(@RequestParam(required = false) OrderStatus status) {
        log.info("PM - Get orders, status={}", status);
        return ResponseEntity.ok(omServiceInterface.getAllOrderByStatus(status));
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
    public ResponseEntity<String> rejectOrder(@PathVariable Long orderId, @RequestParam String reason) {
        log.info("PM - Reject order: id={}", orderId);
        return ResponseEntity.ok(omServiceInterface.rejectOrder(orderId, reason));
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

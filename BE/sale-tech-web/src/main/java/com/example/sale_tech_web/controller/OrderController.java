package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.manager.OrderServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderServiceInterface orderServiceInterface;

    @GetMapping()
    public ResponseEntity<List<OrderDTO>> getOrderByUserId() {
        log.info("Get Orders by User ID");
        List<OrderDTO> orders = orderServiceInterface.getOrderByUserId();
        return ResponseEntity.ok(orders);
    }

    @PostMapping()
    public ResponseEntity<String> placeOrder(@Valid @RequestBody PlaceOrderRequest placeOrderRequest) {
        log.info("Place Order Request: {}", placeOrderRequest);
        String response = orderServiceInterface.placeOrder(placeOrderRequest);
        return ResponseEntity.ok(response);
    }

}


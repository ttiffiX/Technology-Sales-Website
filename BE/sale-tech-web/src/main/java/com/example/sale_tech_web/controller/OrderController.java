package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.order.entity.OrderResponse;
import com.example.sale_tech_web.feature.order.manager.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3000"}
)
@Slf4j
public class OrderController {

    private final OrderService orderService;

//    @GetMapping
//    public List<Order> getAllOrders() {
//        return orderService.getAllOrders();
//    }

    @GetMapping
    public OrderResponse getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping("/add")
    public ResponseEntity<String> placeOrder(@RequestBody Map<String, Object> payload) {
        String name = payload.get("name").toString();
        String address = payload.get("address").toString();
        String phone = payload.get("phone").toString();
        String paymentMethod = payload.get("paymentMethod").toString();
        log.info("Place Order Request");
        String result = orderService.placeOrder(name, phone, address, paymentMethod);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/cancel")
    public ResponseEntity<String> cancelOrder(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.parseLong(payload.get("orderId").toString());
        log.info("Cancel Order Request");
        String result = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(result);
    }
}


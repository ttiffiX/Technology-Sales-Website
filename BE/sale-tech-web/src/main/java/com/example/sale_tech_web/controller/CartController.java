package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.cart.entity.CartResponse;
import com.example.sale_tech_web.feature.cart.manager.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/cart"})
@CrossOrigin(
        origins = {"http://localhost:3000"}
)
@Slf4j
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartResponse getAllCart() {
        log.info("Get all cart products - Start");
        return cartService.getCartItems();
    }

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody Map<String, Object> payload) {
            Long productId = Long.valueOf((Integer) payload.get("productId"));
            int quantity = (int) payload.get("quantity");
            log.info("Adding cart product (id {}) with quantity {}", productId, quantity);
            String result = cartService.addProductToCart(productId, quantity);
            return ResponseEntity.ok(result);
    }

    @PutMapping("/adjust/increment")
    public ResponseEntity<String> incrementQuantity(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        int quantity = (int) payload.get("quantity");
        log.info("Incrementing product quantity for product (id {}) by {}", productId, quantity);

        String result = cartService.incQuantity(productId, quantity);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/adjust/decrement")
    public ResponseEntity<String> decrementQuantity(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        int quantity = (int) payload.get("quantity");
        log.info("Decrementing product quantity for product (id {}) by {}", productId, quantity);

        String result = cartService.decQuantity(productId, quantity);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeFromCart(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        log.info("Removing cart product (id {}) from cart", productId);

        String result = cartService.removeFromCart(productId);
        return ResponseEntity.ok(result);
    }

}

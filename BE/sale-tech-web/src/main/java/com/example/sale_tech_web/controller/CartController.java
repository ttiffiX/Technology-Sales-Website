package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.cart.entity.CartDTO;
import com.example.sale_tech_web.feature.cart.manager.CartServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
@Slf4j
public class CartController {
    private final CartServiceInterface cartServiceInterface;

    @GetMapping
    public ResponseEntity<CartDTO> getMyCart() {
        log.info("Get cart for current user - Start");
        CartDTO cart = cartServiceInterface.getCartItems();
        return ResponseEntity.ok(cart);
    }

    @PostMapping()
    public ResponseEntity<String> addToCart(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        log.info("Adding cart product (id {})", productId);
        String result = cartServiceInterface.addProductToCart(productId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping()
    public ResponseEntity<CartDTO> adjustQuantity(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        int quantity = (int) payload.get("quantity");
        log.info("Change product quantity for product (id {}) by {}", productId, quantity);

        CartDTO result = cartServiceInterface.changeProductQuantity(productId, quantity);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping()
    public ResponseEntity<CartDTO> removeFromCart(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        log.info("Removing cart product (id {}) from cart", productId);

        CartDTO result = cartServiceInterface.removeProductFromCart(productId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/toggle-selection")
    public ResponseEntity<CartDTO> toggleProductSelection(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf((Integer) payload.get("productId"));
        log.info("Toggling selection for product (id {})", productId);

        CartDTO result = cartServiceInterface.toggleProductSelection(productId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/toggle-all")
    public ResponseEntity<CartDTO> toggleAllProducts(@RequestBody Map<String, Object> payload) {
        boolean selectAll = (boolean) payload.get("selectAll");
        log.info("Toggle all products selection: {}", selectAll);

        CartDTO result = cartServiceInterface.toggleAllProducts(selectAll);
        return ResponseEntity.ok(result);
    }

}


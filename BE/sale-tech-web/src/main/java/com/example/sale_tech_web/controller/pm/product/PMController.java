package com.example.sale_tech_web.controller.pm.product;

import com.example.sale_tech_web.feature.product.dto.pm.*;
import com.example.sale_tech_web.feature.product.manager.pm.PMServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/products")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class PMController {
    private final PMServiceInterface productPMService;

    @GetMapping()
    public ResponseEntity<List<PMProductListDTO>> getAllProductsForPM() {
        log.info("PM - Get all products (basic info)");
        return ResponseEntity.ok(productPMService.getAllProductsForPM());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<PMProductDetailDTO> getProductDetailForPM(@PathVariable Long productId) {
        log.info("PM - Get product detail: id={}", productId);
        return ResponseEntity.ok(productPMService.getProductDetailForPM(productId));
    }

    @PostMapping()
    public ResponseEntity<PMProductListDTO> addProduct(@Valid @RequestBody ProductRequest request) {
        log.info("PM - Add product: title={}, categoryId={}", request.getTitle(), request.getCategoryId());
        return ResponseEntity.ok(productPMService.addProduct(request));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<PMProductDetailDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {
        log.info("PM - Update product: id={}", productId);
        return ResponseEntity.ok(productPMService.updateProduct(productId, request));
    }

    @PatchMapping("/{productId}/state")
    public ResponseEntity<String> updateProductState(
            @PathVariable Long productId,
            @RequestParam boolean active) {
        log.info("PM - Update product state: id={}, active={}", productId, active);
        String mes = productPMService.updateState(productId, active);
        return ResponseEntity.ok(mes);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        log.info("PM - Delete product: id={}", productId);
        String mes = productPMService.deleteProduct(productId);
        return ResponseEntity.ok(mes);
    }
}

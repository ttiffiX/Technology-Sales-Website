package com.example.sale_tech_web.controller.pm;

import com.example.sale_tech_web.feature.product.dto.customer.ProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.ProductRequest;
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
@RequestMapping("/pm")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class PMController {
    private final PMServiceInterface pmServiceInterface;

    @GetMapping("/category/{categoryId}/attributes")
    public ResponseEntity<List<AttributeResponse>> getAttrByCategoryId(@PathVariable Long categoryId) {
        log.info("PM - Get attributes for categoryId: {}", categoryId);
        return ResponseEntity.ok(pmServiceInterface.getAttrByCategoryId(categoryId));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductListDTO> addProduct(@Valid @RequestBody ProductRequest request) {
        log.info("PM - Add product: title={}, categoryId={}", request.getTitle(), request.getCategoryId());
        return ResponseEntity.ok(pmServiceInterface.addProduct(request));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductListDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {
        log.info("PM - Update product: id={}", productId);
        return ResponseEntity.ok(pmServiceInterface.updateProduct(productId, request));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        log.info("PM - Delete product: id={}", productId);
        String mes = pmServiceInterface.deleteProduct(productId);
        return ResponseEntity.ok(mes);
    }
}

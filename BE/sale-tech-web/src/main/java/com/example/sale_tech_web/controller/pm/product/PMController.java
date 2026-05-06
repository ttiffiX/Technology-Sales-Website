package com.example.sale_tech_web.controller.pm.product;

import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductDetailDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductRequest;
import com.example.sale_tech_web.feature.product.manager.pm.PMServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/products")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class PMController {
    private final PMServiceInterface productPMService;

    @GetMapping()
    public ResponseEntity<Page<PMProductListDTO>> getAllProductsForPM(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("PM - Get all products (basic info)");
        return ResponseEntity.ok(productPMService.getAllProductsForPM(keyword, categoryId, isActive, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<PMProductDetailDTO> getProductDetailForPM(@PathVariable Long productId) {
        log.info("PM - Get product detail: id={}", productId);
        return ResponseEntity.ok(productPMService.getProductDetailForPM(productId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PMProductListDTO> addProduct(
            @Valid @RequestPart("request") ProductRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("PM - Add product: title={}, categoryId={}", request.getTitle(), request.getCategoryId());
        return ResponseEntity.ok(productPMService.addProduct(request, file));
    }

    @PutMapping(path = "/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PMProductDetailDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestPart("request") ProductRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("PM - Update product: id={}", productId);
        return ResponseEntity.ok(productPMService.updateProduct(productId, request, file));
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

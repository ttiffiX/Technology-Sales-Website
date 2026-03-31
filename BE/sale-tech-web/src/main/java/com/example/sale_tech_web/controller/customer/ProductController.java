package com.example.sale_tech_web.controller.customer;

import com.example.sale_tech_web.feature.product.dto.customer.*;
import com.example.sale_tech_web.feature.product.manager.customer.ProductServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
@Slf4j
public class ProductController {
    private final ProductServiceInterface productServiceInterface;

    @GetMapping
    public ResponseEntity<List<ProductListDTO>> getAllProducts() {
        List<ProductListDTO> products = productServiceInterface.getAllProducts();
        log.info("Get all products: {} products found", products.size());
        return ResponseEntity.ok(products);
    }

    /**
     * GET /product/{id} - Get product detail by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDTO> getProductById(@PathVariable Long id) {
        log.info("Get product detail - ID: {}", id);
        ProductDetailDTO product = productServiceInterface.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = productServiceInterface.getAllCategories();
        log.info("Get all categories: {} categories found", categories.size());
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /product/category/{categoryId} - Filter products by category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductListDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductListDTO> products = productServiceInterface.getProductsByCategory(categoryId);
        log.info("Found {} products in category {}", products.size(), categoryId);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /product/category/{categoryId}/filter-options
     * Get all available filter options for a category (attributes and their values)
     */
    @GetMapping("/category/{categoryId}/filter-options")
    public ResponseEntity<Map<Integer, FilterGroupDTO>> getFilterOptions(
            @PathVariable Long categoryId
    ) {
        log.info("Get filter options for category: {}", categoryId);
        Map<Integer, FilterGroupDTO> options = productServiceInterface.getFilterOptions(categoryId);
        return ResponseEntity.ok(options);
    }

    @GetMapping("/category/{categoryId}/filter")
    public ResponseEntity<List<ProductListDTO>> filterByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false, defaultValue = "id_desc") String sort,
            @RequestParam Map<String, String> allParams
    ) {
        log.info("Filter Product with attributes for category: {}", categoryId);
        // 1. Các key không phải thuộc tính sản phẩm
        Set<String> systemParams = Set.of("minPrice", "maxPrice", "sort", "page", "size");

        // 2. Parse các thuộc tính còn lại thành Map<String, List<String>>
        Map<String, List<String>> attributeFilters = new HashMap<>();

        allParams.forEach((key, value) -> {
            if (!systemParams.contains(key) && value != null && !value.isBlank()) {
                // "8GB,16GB" -> ["8GB", "16GB"]
                List<String> values = Arrays.asList(value.split(","));
                attributeFilters.put(key, values);
            }
        });

        // 3. Gọi Service
        List<ProductListDTO> products = productServiceInterface.filterByAttributes(
                categoryId,
                attributeFilters.isEmpty() ? null : attributeFilters,
                minPrice,
                maxPrice,
                sort
        );

        return ResponseEntity.ok(products);
    }

    /**
     * GET /product/search?keyword=xxx - Search products by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductListDTO>> searchProducts(@RequestParam String keyword) {
        log.info("Search products - Keyword: {}", keyword);
        List<ProductListDTO> products = productServiceInterface.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/compare")
    public ResponseEntity<CompareResponse> compareProducts(@Valid @RequestBody CompareRequest compareRequest) {
        log.info("Compare products - IDs: {}", compareRequest.getProductIds());
        CompareResponse comparison = productServiceInterface.compareProducts(compareRequest);
        return ResponseEntity.ok(comparison);
    }
}

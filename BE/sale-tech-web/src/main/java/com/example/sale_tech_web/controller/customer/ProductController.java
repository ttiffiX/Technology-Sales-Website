package com.example.sale_tech_web.controller.customer;

import com.example.sale_tech_web.feature.product.dto.customer.*;
import com.example.sale_tech_web.feature.product.manager.customer.ProductServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<List<ProductCategoryListDTO>> getTop10ProductsByCategory() {
        List<ProductCategoryListDTO> products = productServiceInterface.getTop10ProductsByCategory();
        log.info("Get top 10 products by category: {} categories found", products.size());
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
    @GetMapping("/filter-options")
    public ResponseEntity<Map<Integer, FilterGroupDTO>> getFilterOptions(
            @RequestParam(required = false) Long categoryId
    ) {
        log.info("Get filter options for category: {}", categoryId);
        Map<Integer, FilterGroupDTO> options = productServiceInterface.getFilterOptions(categoryId);
        return ResponseEntity.ok(options);
    }

    /**
     * GET /product/filter - Unified filter endpoint (search or category filter)
     * Support both keyword search and category filtering with attributes
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductListDTO>> filter(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false, defaultValue = "id_desc") String sort,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "24") Integer size,
            @RequestParam Map<String, String> allParams
    ) {
        log.info("Filter products - keyword: {}, categoryId: {}", keyword, categoryId);

        // Parse attribute filters from query params
        Set<String> systemParams = Set.of("keyword", "categoryId", "minPrice", "maxPrice", "sort", "page", "size");
        Map<String, List<String>> attributeFilters = new HashMap<>();

        allParams.forEach((key, value) -> {
            if (!systemParams.contains(key) && value != null && !value.isBlank()) {
                List<String> values = Arrays.asList(value.split(","));
                attributeFilters.put(key, values);
            }
        });

        // Call unified service filter method
        Page<ProductListDTO> products = productServiceInterface.filter(
                categoryId,
                keyword,
                attributeFilters.isEmpty() ? null : attributeFilters,
                minPrice,
                maxPrice,
                sort,
                page,
                size
        );

        return ResponseEntity.ok(products);
    }

    @PostMapping("/compare")
    public ResponseEntity<CompareResponse> compareProducts(@Valid @RequestBody CompareRequest compareRequest) {
        log.info("Compare products - IDs: {}", compareRequest.getProductIds());
        CompareResponse comparison = productServiceInterface.compareProducts(compareRequest);
        return ResponseEntity.ok(comparison);
    }
}

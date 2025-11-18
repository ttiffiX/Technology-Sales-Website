package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.product.dto.CategoryDTO;
import com.example.sale_tech_web.feature.product.dto.CategoryFilterOptionsDTO;
import com.example.sale_tech_web.feature.product.dto.ProductDetailDTO;
import com.example.sale_tech_web.feature.product.dto.ProductListDTO;
import com.example.sale_tech_web.feature.product.manager.ProductServiceInterface;
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

    /**
     * GET /product/categories - Get all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = productServiceInterface.getAllCategories();
        log.info("Get all categories: {} categories found", categories.size());
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /product - Get all active products
     */
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
     * GET /product/search?keyword=xxx - Search products by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductListDTO>> searchProducts(@RequestParam String keyword) {
        log.info("Search products - Keyword: {}", keyword);
        List<ProductListDTO> products = productServiceInterface.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /product/category/{categoryId}/filter-options
     * Get all available filter options for a category (attributes and their values)
     */
    @GetMapping("/category/{categoryId}/filter-options")
    public ResponseEntity<CategoryFilterOptionsDTO> getFilterOptions(
            @PathVariable Long categoryId
    ) {
        log.info("Get filter options for category: {}", categoryId);
        CategoryFilterOptionsDTO options = productServiceInterface.getFilterOptions(categoryId);
        return ResponseEntity.ok(options);
    }

    /**
     * GET /product/category/{categoryId}/filter
     * Filter products by category with optional attributes and price range
     *
     * Examples:
     * - /product/category/1/filter?minPrice=10000000&maxPrice=30000000
     * - /product/category/1/filter?attr_1=8,16&attr_3=15.6
     * - /product/category/1/filter?attr_1=8,16&minPrice=10000000&maxPrice=30000000
     *
     * Query params:
     * - minPrice (optional): Minimum price
     * - maxPrice (optional): Maximum price
     * - attr_{attributeId} (optional): Comma-separated values for that attribute
     *   Example: attr_1=8,16 means RAM = 8GB OR 16GB
     */
    @GetMapping("/category/{categoryId}/filter")
    public ResponseEntity<List<ProductListDTO>> filterByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false, defaultValue = "price_asc") String sort,
            @RequestParam Map<String, String> allParams
    ) {
        log.info("Filter products - Category: {}, Sort: {}, Params: {}", categoryId, sort, allParams);

        // Parse attribute filters from query params (attr_1=8,16 -> {1: [8, 16]})
        Map<Long, List<String>> attributeFilters = new HashMap<>();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("attr_")) {
                try {
                    Long attributeId = Long.parseLong(key.substring(5));
                    List<String> values = Arrays.asList(entry.getValue().split(","));
                    attributeFilters.put(attributeId, values);
                } catch (NumberFormatException e) {
                    log.warn("Invalid attribute ID in param: {}", key);
                }
            }
        }

        List<ProductListDTO> products = productServiceInterface.filterByAttributes(
                categoryId,
                attributeFilters.isEmpty() ? null : attributeFilters,
                minPrice,
                maxPrice,
                sort
        );
        return ResponseEntity.ok(products);
    }
}

package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.customer.ProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.ProductRequest;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class PMService implements PMServiceInterface {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;

    @Override
    public List<AttributeResponse> getAttrByCategoryId(Long categoryId) {
        return categoryAttributeSchemaRepository
                .findByCategoryIdOrdered(categoryId)
                .stream()
                .map(schema -> AttributeResponse.builder()
                        .attributeId(schema.getId())
                        .code(schema.getCode())
                        .name(schema.getName())
                        .unit(schema.getUnit())
                        .dataType(schema.getDataType())
                        .groupName(schema.getGroupName())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public ProductListDTO addProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive())
                .category(category)
                .attributes(request.getAttributes())
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        String fileName = savedProduct.getId() + ".png";
        savedProduct.setImageUrl(fileName);

        return toListDTO(productRepository.save(savedProduct));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, allEntries = true)
    })
    public ProductListDTO updateProduct(Long productId, ProductRequest request) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        Product updated = existing.toBuilder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive())
                .category(existing.getCategory())
                .attributes(request.getAttributes())
                .build();

        Product saved = productRepository.save(updated);
        return toListDTO(saved);
    }

    // ────────────────────────────────────────────────────────────────
    // DELETE PRODUCT  (soft-delete)
    // ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        product.setIsActive(false);
        productRepository.save(product);
        return "Product with ID " + productId + " has been deactivated (soft-deleted).";
    }

    // ────────────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────────────
    private ProductListDTO toListDTO(Product p) {
        return ProductListDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .build();
    }
}

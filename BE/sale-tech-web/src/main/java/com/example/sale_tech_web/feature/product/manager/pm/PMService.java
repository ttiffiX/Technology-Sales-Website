package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;
import com.example.sale_tech_web.feature.product.dto.customer.ProductFilterGroupDTO;
import com.example.sale_tech_web.feature.product.dto.pm.*;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class PMService implements PMServiceInterface {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;

    @Autowired
    private CacheManager cacheManager;

    @Override
    @Transactional(readOnly = true)
    public List<PMProductListDTO> getAllProductsForPM() {
        return productRepository.findAllByOrderByIdDesc().stream()
                .map(this::toListDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PMProductDetailDTO getProductDetailForPM(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        return convertToDetailDTO(product);
    }

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
    public PMProductListDTO addProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        validateProductAttributes(category, request.getAttributes());

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .quantitySold(request.getQuantitySold() == null ? 0 : request.getQuantitySold())
                .isActive(request.getIsActive())
                .category(category)
                .attributes(request.getAttributes())
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        if (request.getImageUrl() == null || request.getImageUrl().isEmpty()) {
            String fileName = savedProduct.getId() + ".png";
            savedProduct.setImageUrl(fileName);
        } else {
            savedProduct.setImageUrl(request.getImageUrl());
        }
        return toListDTO(savedProduct);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#request.categoryId"),
    })
    public PMProductDetailDTO updateProduct(Long productId, ProductRequest request) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        validateProductAttributes(existing.getCategory(), request.getAttributes());

        Product updated = existing.toBuilder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl() == null ? existing.getImageUrl() : request.getImageUrl())
                .quantity(request.getQuantity())
                .quantitySold(request.getQuantitySold() == null ? existing.getQuantitySold() : request.getQuantitySold())
                .isActive(request.getIsActive())
                .category(existing.getCategory())
                .attributes(request.getAttributes())
                .build();

        Product saved = productRepository.save(updated);
        return convertToDetailDTO(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String updateState(Long productId, boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        if (product.getIsActive() == active) {
            return "Product is already " + (active ? "active" : "inactive") + ". No changes made.";
        }

        product.setIsActive(active);
        productRepository.save(product);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.PRODUCT_BY_CATEGORY)).evict(product.getCategory().getId());
        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(product.getCategory().getId());

        return "Product with ID " + productId + " has been deactivated.";
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        productRepository.delete(product);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.PRODUCT_BY_CATEGORY)).evict(product.getCategory().getId());
        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(product.getCategory().getId());


        return "Product with ID " + productId + " has been deleted.";
    }

    @Override
    public List<CategoryAttribute> getAttributeByCategory(Long categoryId) {
        List<CategoryAttributeSchema> schema = categoryAttributeSchemaRepository.findByCategoryIdOrdered(categoryId);
        return schema.stream().map(s -> CategoryAttribute.builder()
                .attributeId(s.getId())
                .code(s.getCode())
                .name(s.getName())
                .unit(s.getUnit())
                .dataType(s.getDataType())
                .isFilterable(s.getIsFilterable())
                .groupName(s.getGroupName())
                .groupOrder(s.getGroupOrder())
                .displayOrder(s.getDisplayOrder())
                .build()).toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId"),
    })
    public CategoryAttribute addAttributeSchema(Long categoryId, CategoryAttributeRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        if (categoryAttributeSchemaRepository.existsByCategoryIdAndCode(categoryId, request.getCode())) {
            throw new ResponseStatusException(BAD_REQUEST, "Attribute code already exists in this category");
        }

        CategoryAttributeSchema schema = CategoryAttributeSchema.builder()
                .category(category)
                .name(request.getName())
                .unit(request.getUnit())
                .dataType(request.getDataType())
                .isFilterable(request.getIsFilterable())
                .code(request.getCode())
                .groupName(request.getGroupName())
                .groupOrder(request.getGroupOrder())
                .displayOrder(request.getDisplayOrder())
                .build();

        schema = categoryAttributeSchemaRepository.save(schema);
        return convertToCADTO(schema);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId"),
    })

    public CategoryAttribute updateAttributeSchema(Long categoryId, CategoryAttributeRequest request) {
        CategoryAttributeSchema schema = categoryAttributeSchemaRepository.findByCategoryIdAndCode(categoryId, request.getCode());

        if (schema == null) {
            throw new ResponseStatusException(NOT_FOUND, "Attribute schema not found for category id=" + categoryId + " and code='" + request.getCode() + "'");
        }

        if (!schema.getDataType().equals(request.getDataType()) || !schema.getCode().equals(request.getCode())) {
            boolean isUsed = productRepository.existsByAttributeCodeAndCategoryId(schema.getCode(), categoryId);
            if (isUsed) {
                throw new ResponseStatusException(BAD_REQUEST, "Cannot change DATA TYPE or CODE of an attribute already in use by products.");
            }
        }

        schema.setName(request.getName());
        schema.setUnit(request.getUnit());
        schema.setCode(request.getCode());
        schema.setDataType(request.getDataType());
        schema.setIsFilterable(request.getIsFilterable());
        schema.setGroupName(request.getGroupName());
        schema.setGroupOrder(request.getGroupOrder());
        schema.setDisplayOrder(request.getDisplayOrder());

        schema = categoryAttributeSchemaRepository.save(schema);
        return convertToCADTO(schema);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public String deleteAttributeSchema(Long attributeId) {
        CategoryAttributeSchema schema = categoryAttributeSchemaRepository.findById(attributeId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Schema not found"));

        boolean isUsed = productRepository.existsByAttributeCodeAndCategoryId(
                schema.getCode(),
                schema.getCategory().getId()
        );

        if (isUsed) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot delete attribute schema that is still in use by products.");
        }

        categoryAttributeSchemaRepository.delete(schema);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(schema.getCategory().getId());

        return "Attribute schema with ID " + attributeId + " has been deleted.";
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    })
    public CategoryDTO addCategory(String name) {
        Category category = new Category();
        category.setName(name);
        return convertCategoryDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    })
    public CategoryDTO updateCategory(Long categoryId, String name) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
        category.setName(name);
        category = categoryRepository.save(category);
        return convertCategoryDTO(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId"),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#categoryId")
    })
    public String deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        boolean exist = productRepository.existsByCategory(category);
        if (exist) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot delete category that still has products.");
        }

        boolean existSchema = categoryAttributeSchemaRepository.existsByCategory(category);
        if (existSchema) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot delete category that still has attribute schemas.");
        }

        categoryRepository.delete(category);
        return "Category with ID " + categoryId + " has been deleted.";
    }

    private PMProductListDTO toListDTO(Product p) {
        return PMProductListDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .price(p.getPrice())
                .isActive(p.getIsActive())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .build();
    }

    private void validateProductAttributes(Category category, Map<String, Object> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Attributes are required");
        }

        List<CategoryAttributeSchema> schemas =
                categoryAttributeSchemaRepository.findByCategoryIdOrdered(category.getId());

        if (schemas.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "No attribute schema configured for category id=" + category.getId());
        }

        Map<String, CategoryAttributeSchema> schemaByCode = schemas.stream()
                .collect(Collectors.toMap(
                        s -> s.getCode().trim().toLowerCase(),
                        s -> s,
                        (first, ignored) -> first
                ));

        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            String rawCode = entry.getKey();
            Object rawValue = entry.getValue();

            if (rawCode == null || rawCode.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "Attribute code must not be blank");
            }

            String normalizedCode = rawCode.trim().toLowerCase();
            CategoryAttributeSchema schema = schemaByCode.get(normalizedCode);
            if (schema == null) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "Unknown attribute code '" + rawCode + "' for category id=" + category.getId());
            }

            if (rawValue == null) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "Attribute '" + rawCode + "' must not be null");
            }

            String dataType = schema.getDataType() == null ? "" : schema.getDataType().trim().toLowerCase();
            switch (dataType) {
                case "number" -> {
                    if (!(rawValue instanceof Number)) {
                        throw new ResponseStatusException(BAD_REQUEST,
                                "Attribute '" + rawCode + "' must be NUMBER");
                    }
                }
                case "boolean" -> {
                    if (!(rawValue instanceof Boolean)) {
                        throw new ResponseStatusException(BAD_REQUEST,
                                "Attribute '" + rawCode + "' must be BOOLEAN");
                    }
                }
                case "text" -> {
                    if (rawValue instanceof String) {
                        continue;
                    }

                    boolean isStringList = rawValue instanceof List<?> list
                            && list.stream().allMatch(item -> item instanceof String);

                    if (!isStringList) {
                        throw new ResponseStatusException(BAD_REQUEST,
                                "Attribute '" + rawCode + "' must be TEXT or list of TEXT");
                    }
                }
                case "list" -> {
                    if (!(rawValue instanceof List<?>)) {
                        throw new ResponseStatusException(BAD_REQUEST,
                                "Attribute '" + rawCode + "' must be LIST");
                    }
                }
                default -> throw new ResponseStatusException(BAD_REQUEST,
                        "Unsupported dataType '" + schema.getDataType() + "' for attribute '" + rawCode + "'");
            }
        }
    }

    private PMProductDetailDTO convertToDetailDTO(Product product) {
        Long catId = product.getCategory().getId();
        Map<String, Object> raw = product.getAttributes();

        List<CategoryAttributeSchema> schemas = categoryAttributeSchemaRepository.findByCategoryIdOrdered(catId);

        Map<Integer, ProductFilterGroupDTO> attributes = new LinkedHashMap<>();
        for (CategoryAttributeSchema s : schemas) {
            Object value = raw.get(s.getCode());
            if (value == null) continue;

            ProductFilterGroupDTO.AttributeDTO attrDTO = ProductFilterGroupDTO.AttributeDTO.builder()
                    .attributeName(s.getName())
                    .unit(s.getUnit())
                    .availableValues(value)
                    .build();

            attributes.computeIfAbsent(s.getGroupOrder(), _ -> {
                ProductFilterGroupDTO newGroup = new ProductFilterGroupDTO();
                newGroup.setGroupName(s.getGroupName());
                newGroup.setFilterAttributes(new ArrayList<>());
                return newGroup;
            });

            attributes.get(s.getGroupOrder()).getFilterAttributes().add(attrDTO);
        }

        return PMProductDetailDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .quantitySold(product.getQuantitySold())
                .quantity(product.getQuantity())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .categoryId(catId)
                .categoryName(product.getCategory().getName())
                .attributes(attributes)
                .build();
    }

    private CategoryAttribute convertToCADTO(CategoryAttributeSchema schema) {
        return CategoryAttribute.builder()
                .attributeId(schema.getId())
                .code(schema.getCode())
                .name(schema.getName())
                .unit(schema.getUnit())
                .dataType(schema.getDataType())
                .isFilterable(schema.getIsFilterable())
                .groupName(schema.getGroupName())
                .groupOrder(schema.getGroupOrder())
                .displayOrder(schema.getDisplayOrder())
                .build();
    }

    private CategoryDTO convertCategoryDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }
}

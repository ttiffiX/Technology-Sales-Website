package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttributeRequest;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
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

import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class AttributePMService implements AttributePMServiceInterface {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;

    @Autowired
    private CacheManager cacheManager;

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
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
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
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
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
}


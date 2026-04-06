package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttributeRequest;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeGroupRepository;
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
    @Autowired
    private CategoryAttributeGroupRepository categoryAttributeGroupRepository;

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
                        .groupName(schema.getCategoryAttributeGroup().getName())
                        .build())
                .toList();
    }

    @Override
    public List<CategoryAttribute> getAttributeByCategory(Long categoryId) {
        return categoryAttributeSchemaRepository
                .findByCategoryIdOrdered(categoryId)
                .stream()
                .map(s -> CategoryAttribute.builder()
                        .attributeId(s.getId())
                        .code(s.getCode())
                        .name(s.getName())
                        .unit(s.getUnit())
                        .dataType(s.getDataType())
                        .isFilterable(s.getIsFilterable())
                        .groupName(s.getCategoryAttributeGroup().getName())
                        .groupOrder(s.getCategoryAttributeGroup().getGroupOrder())
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

        CategoryAttributeGroup group = categoryAttributeGroupRepository.findByIdAndCategoryId(request.getGroupId(), categoryId);

        if (group == null) {
            throw new ResponseStatusException(NOT_FOUND, "Attribute group not found.");
        }

        int displayOrder = getNextDisplayOrder(group.getId());

        CategoryAttributeSchema schema = CategoryAttributeSchema.builder()
                .category(category)
                .name(request.getName())
                .unit(request.getUnit())
                .dataType(request.getDataType())
                .isFilterable(request.getIsFilterable())
                .code(request.getCode())
                .categoryAttributeGroup(group)
                .displayOrder(displayOrder)
                .build();

        schema = categoryAttributeSchemaRepository.save(schema);
        return convertToCADTO(schema);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true),
//            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
    })
    public CategoryAttribute updateAttributeSchema(Long attributeId, CategoryAttributeRequest request) {
        CategoryAttributeSchema schema = categoryAttributeSchemaRepository.findById(attributeId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attribute not found"));

        long categoryId = schema.getCategory().getId();

        if (!schema.getDataType().equals(request.getDataType()) || !schema.getCode().equals(request.getCode())) {
            boolean isUsed = productRepository.existsByAttributeCodeAndCategoryId(schema.getCode(), categoryId);
            if (isUsed) {
                throw new ResponseStatusException(BAD_REQUEST, "Cannot change DATA TYPE or CODE of an attribute already in use by products.");
            }
        }

        if (!schema.getCode().equals(request.getCode()) && categoryAttributeSchemaRepository.existsByCategoryIdAndCode(categoryId, request.getCode())) {
            throw new ResponseStatusException(BAD_REQUEST, "Attribute code already exists in this category");
        }

        CategoryAttributeGroup group = schema.getCategoryAttributeGroup();
        if (!Objects.equals(group.getId(), request.getGroupId())) {
            CategoryAttributeGroup newGroup = categoryAttributeGroupRepository.findByIdAndCategoryId(request.getGroupId(), categoryId);

            if (newGroup == null) {
                throw new ResponseStatusException(NOT_FOUND, "Attribute group not found.");
            }

            schema.setCategoryAttributeGroup(newGroup);
            schema.setDisplayOrder(getNextDisplayOrder(newGroup.getId()));
        }

        schema.setName(request.getName());
        schema.setUnit(request.getUnit());
        schema.setCode(request.getCode());
        schema.setDataType(request.getDataType());
        schema.setIsFilterable(request.getIsFilterable());

        schema = categoryAttributeSchemaRepository.save(schema);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(categoryId);

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
        CategoryAttributeGroup group = schema.getCategoryAttributeGroup();
        return CategoryAttribute.builder()
                .attributeId(schema.getId())
                .code(schema.getCode())
                .name(schema.getName())
                .unit(schema.getUnit())
                .dataType(schema.getDataType())
                .isFilterable(schema.getIsFilterable())
                .groupName(group.getName())
                .groupOrder(group.getGroupOrder())
                .displayOrder(schema.getDisplayOrder())
                .build();
    }

    private int getNextDisplayOrder(Long groupId) {
        Integer maxOrder = categoryAttributeSchemaRepository.findMaxDisplayOrderByGroupId(groupId);
        return (maxOrder == null) ? 1 : maxOrder + 1;
    }
}


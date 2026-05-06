package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttributeResponse;
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

import java.util.*;
import java.util.stream.Collectors;

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
    public List<CategoryAttributeResponse> getAttributeByCategory(Long categoryId) {
        List<CategoryAttributeSchema> schemas = categoryAttributeSchemaRepository.findByCategoryIdOrdered(categoryId);

        List<CategoryAttributeResponse> finalResult = new ArrayList<>();
        CategoryAttributeResponse currentGroup = null;

        for (CategoryAttributeSchema schema : schemas) {
            Long groupId = schema.getCategoryAttributeGroup().getId();

            // Nếu là phần tử đầu tiên (currentGroup == null)
            // HOẶC ID của Group hiện tại khác với ID của Group trước đó
            if (currentGroup == null || !currentGroup.getGroupId().equals(groupId)) {

                currentGroup = CategoryAttributeResponse.builder()
                        .groupId(groupId)
                        .groupName(schema.getCategoryAttributeGroup().getName())
                        .groupOrder(schema.getCategoryAttributeGroup().getGroupOrder())
                        .categoryAttributeList(new ArrayList<>())
                        .build();

                finalResult.add(currentGroup);
            }
            currentGroup.getCategoryAttributeList().add(convertToCADTO(schema));
        }

        return finalResult;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
    })
    public String addAttributeSchema(Long categoryId, CategoryAttributeRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (categoryAttributeSchemaRepository.existsByCategoryIdAndCode(categoryId, request.getCode())) {
            throw new BadRequestException("Attribute code already exists in this category");
        }

        CategoryAttributeGroup group = categoryAttributeGroupRepository.findByIdAndCategoryId(request.getGroupId(), categoryId);

        if (group == null) {
            throw new NotFoundException("Attribute group not found.");
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

        categoryAttributeSchemaRepository.save(schema);
        return "Attribute schema added successfully with ID: " + schema.getId();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true),
//            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
    })
    public String updateAttributeSchema(Long attributeId, CategoryAttributeRequest request) {
        CategoryAttributeSchema schema = categoryAttributeSchemaRepository.findById(attributeId)
                .orElseThrow(() -> new NotFoundException("Attribute not found"));

        long categoryId = schema.getCategory().getId();

        if (!schema.getDataType().equals(request.getDataType()) || !schema.getCode().equals(request.getCode())) {
            boolean isUsed = productRepository.existsByAttributeCodeAndCategoryId(schema.getCode(), categoryId);
            if (isUsed) {
                throw new BadRequestException("Cannot change DATA TYPE or CODE of an attribute already in use by products.");
            }
        }

        if (!schema.getCode().equals(request.getCode()) && categoryAttributeSchemaRepository.existsByCategoryIdAndCode(categoryId, request.getCode())) {
            throw new BadRequestException("Attribute code already exists in this category");
        }

        CategoryAttributeGroup group = schema.getCategoryAttributeGroup();
        if (!Objects.equals(group.getId(), request.getGroupId())) {
            CategoryAttributeGroup newGroup = categoryAttributeGroupRepository.findByIdAndCategoryId(request.getGroupId(), categoryId);

            if (newGroup == null) {
                throw new NotFoundException("Attribute group not found or category not match.");
            }

            int displayOrder = getNextDisplayOrder(newGroup.getId());

            schema.setCategoryAttributeGroup(newGroup);
            schema.setDisplayOrder(displayOrder);
        }

        schema.setName(request.getName());
        schema.setUnit(request.getUnit());
        schema.setCode(request.getCode());
        schema.setDataType(request.getDataType());
        schema.setIsFilterable(request.getIsFilterable());

        categoryAttributeSchemaRepository.save(schema);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(categoryId);

        return "Attribute schema updated successfully with ID: " + schema.getId();
    }

    @Override
    @Transactional
    public String updateDisplayOrder(Long groupId, List<Long> attributeIds) {
        if (attributeIds == null || attributeIds.isEmpty()) {
            return "Attribute ID list is null or empty.";
        }

        List<CategoryAttributeSchema> currentAttributes = categoryAttributeSchemaRepository.findByCategoryAttributeGroupId(groupId);

        Map<Long, CategoryAttributeSchema> attributeMap = currentAttributes.stream()
                .collect(Collectors.toMap(CategoryAttributeSchema::getId, a -> a));

        if (currentAttributes.size() != attributeIds.size()) {
            throw new BadRequestException(
                    "Attribute Id list size does not match the number of attributes in system.");
        }

        for (int i = 0; i < attributeIds.size(); i++) {
            Long id = attributeIds.get(i);
            CategoryAttributeSchema attr = attributeMap.get(id);

            if (attr == null) {
                throw new BadRequestException(
                        "Attribute ID " + id + " does not exist in this category.");
            }

            attr.setDisplayOrder(i + 1);
        }

        categoryAttributeSchemaRepository.saveAll(currentAttributes);
        return "Display order updated successfully.";
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public String deleteAttributeSchema(Long attributeId) {
        CategoryAttributeSchema schema = categoryAttributeSchemaRepository.findById(attributeId)
                .orElseThrow(() -> new NotFoundException("Schema not found"));

        boolean isUsed = productRepository.existsByAttributeCodeAndCategoryId(
                schema.getCode(),
                schema.getCategory().getId()
        );

        if (isUsed) {
            throw new BadRequestException("Cannot delete attribute schema that is still in use by products.");
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
                .displayOrder(schema.getDisplayOrder())
                .build();
    }

    private int getNextDisplayOrder(Long groupId) {
        Integer maxOrder = categoryAttributeSchemaRepository.findMaxDisplayOrderByGroupId(groupId);
        return (maxOrder == null) ? 1 : maxOrder + 1;
    }
}


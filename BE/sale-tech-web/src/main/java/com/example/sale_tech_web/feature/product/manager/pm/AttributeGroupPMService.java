package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupDTO;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupRequest;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeGroupRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class AttributeGroupPMService implements AttributeGroupPMServiceInterface {

    private final CategoryAttributeGroupRepository categoryAttributeGroupRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;

    @Override
    public List<AttributeGroupDTO> getGroupByCategory(Long categoryId) {
        List<CategoryAttributeGroup> groups = categoryAttributeGroupRepository.findByCategoryIdOrderByGroupOrderAsc(categoryId);
        List<AttributeGroupDTO> attributeGroupDTOS = new ArrayList<>();

        for (CategoryAttributeGroup group : groups) {
            attributeGroupDTOS.add(convertToDTO(group));
        }
        return attributeGroupDTOS;
    }

    @Override
    @Transactional
    public AttributeGroupDTO addGroupByCategory(AttributeGroupRequest request) {
        Long categoryId = request.getCategoryId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category Not Found"));

        if (categoryAttributeGroupRepository.existsByCategoryIdAndName(categoryId, request.getName())) {
            throw new ResponseStatusException(BAD_REQUEST, "Attribute Group already exists");
        }

        int groupOrder = getNextGroupOrder(categoryId);

        CategoryAttributeGroup group = CategoryAttributeGroup.builder()
                .category(category)
                .name(request.getName())
                .groupOrder(groupOrder)
                .build();

        group = categoryAttributeGroupRepository.save(group);

        return convertToDTO(group);
    }

    @Override
    @Transactional
    public AttributeGroupDTO updateGroup(Long groupId, AttributeGroupRequest request) {
        CategoryAttributeGroup group = categoryAttributeGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attribute Group Not Found"));

        if (!group.getCategory().getId().equals(request.getCategoryId())) {
            // Kiểm tra xem group này đã có "con" (Attribute Schema) chưa
            boolean hasAttributes = categoryAttributeSchemaRepository.existsByCategoryAttributeGroupId(groupId);
            if (hasAttributes) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "Cannot update attribute group when attribute group already used");
            }

            // Nếu chưa có con, cho phép đổi sang Category mới
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category Not Found"));

            group.setCategory(newCategory);
        }

        if (!group.getName().equals(request.getName()) &&
                categoryAttributeGroupRepository.existsByCategoryIdAndName(group.getCategory().getId(), request.getName())) {
            throw new ResponseStatusException(BAD_REQUEST, "Attribute Group already exists");
        }

        group.setName(request.getName());

        return convertToDTO(categoryAttributeGroupRepository.save(group));
    }

    @Override
    @Transactional
    public String UpdateGroupOrder(Long categoryId, List<Long> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return "Group ID list is null or empty.";
        }

        List<CategoryAttributeGroup> groups = categoryAttributeGroupRepository.findByCategoryId(categoryId);

        if (groups.size() != groupIds.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "Group ID list size does not match the number of groups in system");
        }

        Map<Long, CategoryAttributeGroup> groupMap = groups.stream()
                .collect(Collectors.toMap(CategoryAttributeGroup::getId, g -> g));

        for (int i = 0; i < groupIds.size(); i++) {
            CategoryAttributeGroup group = groupMap.get(groupIds.get(i));

            if (group == null) {
                throw new ResponseStatusException(BAD_REQUEST, "Group ID " + groupIds.get(i) + " does not exist in this category");
            }
            group.setGroupOrder(i + 1);
        }

        categoryAttributeGroupRepository.saveAll(groups);
        return "Group order updated successfully.";
    }

    @Override
    @Transactional
    public String deleteGroupByCategory(Long groupId) {
        CategoryAttributeGroup group = categoryAttributeGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attribute Group Not Found"));

        boolean hasAttributes = categoryAttributeSchemaRepository.existsByCategoryAttributeGroupId(groupId);
        if (hasAttributes) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Cannot delete attribute group when attribute group already used");
        }

        categoryAttributeGroupRepository.delete(group);
        return "Attribute Group deleted successfully.";
    }


//Helper method

    private AttributeGroupDTO convertToDTO(CategoryAttributeGroup group) {
        return AttributeGroupDTO.builder()
                .id(group.getId())
                .categoryId(group.getCategory().getId())
                .name(group.getName())
                .groupOrder(group.getGroupOrder())
                .build();
    }

    private int getNextGroupOrder(Long categoryId) {
        Integer maxOrder = categoryAttributeGroupRepository.findMaxGroupOrderByCategoryId(categoryId);
        return (maxOrder == null) ? 1 : maxOrder + 1;
    }
}


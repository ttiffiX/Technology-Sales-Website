package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupDTO;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupRequest;

import java.util.List;

public interface AttributeGroupPMServiceInterface {
    List<AttributeGroupDTO> getGroupByCategory(Long categoryId);

    AttributeGroupDTO addGroupByCategory(AttributeGroupRequest request);

    AttributeGroupDTO updateGroup(Long groupId, AttributeGroupRequest request);

    String UpdateGroupOrder(Long categoryId, List<Long> groupIds);

    String deleteGroupByCategory(Long groupId);
}


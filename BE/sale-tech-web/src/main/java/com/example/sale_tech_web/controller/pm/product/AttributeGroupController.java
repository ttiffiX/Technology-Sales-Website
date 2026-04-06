package com.example.sale_tech_web.controller.pm.product;

import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupDTO;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_group_dto.AttributeGroupRequest;
import com.example.sale_tech_web.feature.product.manager.pm.AttributeGroupPMServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/attribute-groups")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class AttributeGroupController {
    private final AttributeGroupPMServiceInterface attributeGroupPMService;

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<AttributeGroupDTO>> getAttributeGroup(@PathVariable Long categoryId) {
        log.info("Get all attribute group with category id {}", categoryId);
        List<AttributeGroupDTO> groups = attributeGroupPMService.getGroupByCategory(categoryId);
        return ResponseEntity.ok(groups);
    }

    @PostMapping()
    public ResponseEntity<AttributeGroupDTO> createAttributeGroup(@RequestBody AttributeGroupRequest request) {
        log.info("Create new attribute group with category id {}", request.getCategoryId());
        AttributeGroupDTO group = attributeGroupPMService.addGroupByCategory(request);
        return ResponseEntity.ok(group);
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<AttributeGroupDTO> updateAttributeGroup(@RequestBody AttributeGroupRequest request, @PathVariable Long groupId) {
        log.info("Update attribute group with group id {}", groupId);
        AttributeGroupDTO group = attributeGroupPMService.updateGroup(groupId, request);
        return ResponseEntity.ok(group);
    }

    @PatchMapping("/category/{categoryId}/reorder")
    public ResponseEntity<String> updateGroupOrder(@RequestBody List<Long> groupIds, @PathVariable Long categoryId) {
        log.info("Update attribute group order with group ids size = {}", groupIds.size());
        String result = attributeGroupPMService.UpdateGroupOrder(categoryId, groupIds);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteAttributeGroup(@PathVariable Long groupId) {
        log.info("Delete attribute group with group id {}", groupId);
        String result = attributeGroupPMService.deleteGroupByCategory(groupId);
        return ResponseEntity.ok(result);
    }
}

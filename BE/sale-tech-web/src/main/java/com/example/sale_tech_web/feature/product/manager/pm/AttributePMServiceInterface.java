package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttributeRequest;

import java.util.List;

public interface AttributePMServiceInterface {
    /*
     * Lấy danh sách thuộc tính của một danh mục phục vụ cho thêm/sửa attribute schema.
     */
    List<CategoryAttributeResponse> getAttributeByCategory(Long categoryId);

    /*
     * Lấy danh sách thuộc tính của một danh mục phục vụ cho thêm/sửa sản phẩm.
     */
    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    String addAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    String updateAttributeSchema(Long attributeId, CategoryAttributeRequest request);

    String updateDisplayOrder(Long groupId, List<Long> attributeIds);

    String deleteAttributeSchema(Long attributeId);
}


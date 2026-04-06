package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.attribute_dto.CategoryAttributeRequest;

import java.util.List;

public interface AttributePMServiceInterface {
    /*
     * Lấy danh sách thuộc tính của một danh mục phục vụ cho thêm/sửa sản phẩm.
     */
    List<CategoryAttribute> getAttributeByCategory(Long categoryId);

    /*
     * Lấy danh sách thuộc tính của một danh mục phục vụ cho thêm/sửa attribute schema.
     */
    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    CategoryAttribute addAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    CategoryAttribute updateAttributeSchema(Long attributeId, CategoryAttributeRequest request);

    String deleteAttributeSchema(Long attributeId);
}


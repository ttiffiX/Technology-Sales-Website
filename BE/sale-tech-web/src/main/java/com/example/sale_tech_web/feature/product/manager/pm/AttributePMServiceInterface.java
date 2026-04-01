package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttributeRequest;

import java.util.List;

public interface AttributePMServiceInterface {
    List<CategoryAttribute> getAttributeByCategory(Long categoryId);

    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    CategoryAttribute addAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    CategoryAttribute updateAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    String deleteAttributeSchema(Long attributeId);
}


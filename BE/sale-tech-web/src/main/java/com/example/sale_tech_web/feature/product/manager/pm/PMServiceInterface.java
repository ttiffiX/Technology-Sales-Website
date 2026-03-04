package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;

import java.util.List;

public interface PMServiceInterface {
    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    void addProductToCategory(Long categoryId);

    void updateProductDetails(Long productId);

    void deleteProduct(Long productId);

}

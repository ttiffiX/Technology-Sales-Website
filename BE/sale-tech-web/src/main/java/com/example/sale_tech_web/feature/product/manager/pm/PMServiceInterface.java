package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;
import com.example.sale_tech_web.feature.product.dto.pm.*;

import java.util.List;

public interface PMServiceInterface {

    List<PMProductListDTO> getAllProductsForPM();

    PMProductDetailDTO getProductDetailForPM(Long productId);

    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    PMProductListDTO addProduct(ProductRequest request);

    PMProductDetailDTO updateProduct(Long productId, ProductRequest request);

    String updateState(Long productId, boolean active);

    String deleteProduct(Long productId);

    List<CategoryAttribute> getAttributeByCategory(Long categoryId);

    // Attribute Schema methods
    CategoryAttribute addAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    CategoryAttribute updateAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    String deleteAttributeSchema(Long attributeId);

    //Category
    CategoryDTO addCategory(String name);

    CategoryDTO updateCategory(Long categoryId, String name);

    String deleteCategory(Long categoryId);
}

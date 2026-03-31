package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;
import com.example.sale_tech_web.feature.product.dto.pm.*;

import java.util.List;

public interface PMServiceInterface {

    //product
    List<PMProductListDTO> getAllProductsForPM();

    PMProductDetailDTO getProductDetailForPM(Long productId);

    PMProductListDTO addProduct(ProductRequest request);

    PMProductDetailDTO updateProduct(Long productId, ProductRequest request);

    String updateState(Long productId, boolean active);

    String deleteProduct(Long productId);

    // Attribute Schema methods
    List<CategoryAttribute> getAttributeByCategory(Long categoryId);

    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    CategoryAttribute addAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    CategoryAttribute updateAttributeSchema(Long categoryId, CategoryAttributeRequest request);

    String deleteAttributeSchema(Long attributeId);

    //Category
    CategoryDTO addCategory(String name);

    CategoryDTO updateCategory(Long categoryId, String name);

    String deleteCategory(Long categoryId);
}

package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.customer.ProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.ProductRequest;

import java.util.List;

public interface PMServiceInterface {

    List<AttributeResponse> getAttrByCategoryId(Long categoryId);

    ProductListDTO addProduct(ProductRequest request);

    ProductListDTO updateProduct(Long productId, ProductRequest request);

    String deleteProduct(Long productId);
}

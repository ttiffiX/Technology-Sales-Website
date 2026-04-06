package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductDetailDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductRequest;

import java.util.List;

public interface PMServiceInterface {
    List<PMProductListDTO> getAllProductsForPM();

    PMProductDetailDTO getProductDetailForPM(Long productId);

    PMProductListDTO addProduct(ProductRequest request);

    PMProductDetailDTO updateProduct(Long productId, ProductRequest request);

    String updateState(Long productId, boolean active);

    String deleteProduct(Long productId);
}


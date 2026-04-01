package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.pm.PMProductDetailDTO;
import com.example.sale_tech_web.feature.product.dto.pm.PMProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.ProductRequest;

import java.util.List;

public interface PMServiceInterface {
    List<PMProductListDTO> getAllProductsForPM();

    PMProductDetailDTO getProductDetailForPM(Long productId);

    PMProductListDTO addProduct(ProductRequest request);

    PMProductDetailDTO updateProduct(Long productId, ProductRequest request);

    String updateState(Long productId, boolean active);

    String deleteProduct(Long productId);
}


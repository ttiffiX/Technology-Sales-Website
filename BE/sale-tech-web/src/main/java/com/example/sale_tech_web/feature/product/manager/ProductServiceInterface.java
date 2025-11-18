package com.example.sale_tech_web.feature.product.manager;

import com.example.sale_tech_web.feature.product.dto.*;

import java.util.List;
import java.util.Map;

public interface ProductServiceInterface {
    List<CategoryDTO> getAllCategories();

    List<ProductListDTO> getAllProducts();

    ProductDetailDTO getProductById(Long productId);

    CategoryFilterOptionsDTO getFilterOptions(Long categoryId);

    List<ProductListDTO> filterByAttributes(Long categoryId,
                                            Map<Long, List<String>> attributeFilters,
                                            Integer minPrice,
                                            Integer maxPrice,
                                            String sort);

    List<ProductListDTO> getProductsByCategory(Long categoryId);

    List<ProductListDTO> searchProducts(String keyword);

}

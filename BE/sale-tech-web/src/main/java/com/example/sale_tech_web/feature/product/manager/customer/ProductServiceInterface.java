package com.example.sale_tech_web.feature.product.manager.customer;

import com.example.sale_tech_web.feature.product.dto.customer.*;

import java.util.List;
import java.util.Map;

public interface ProductServiceInterface {
    List<CategoryDTO> getAllCategories();

    List<ProductListDTO> getAllProducts();

    ProductDetailDTO getProductById(Long productId);

    Map<Integer, FilterGroupDTO> getFilterOptions(Long categoryId);

    List<ProductListDTO> filterByAttributes(Long categoryId,
                                            Map<String, List<String>> attributeFilters,
                                            Integer minPrice,
                                            Integer maxPrice,
                                            String sort);

    List<ProductListDTO> getProductsByCategory(Long categoryId);

    List<ProductListDTO> searchProducts(String keyword);

    CompareResponse compareProducts(CompareRequest compareRequest);

}

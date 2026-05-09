package com.example.sale_tech_web.feature.product.manager.customer;

import com.example.sale_tech_web.feature.product.dto.customer.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;

public interface ProductServiceInterface {
    List<CategoryDTO> getAllCategories();

    List<ProductCategoryListDTO> getTop10ProductsByCategory();

    ProductDetailDTO getProductById(Long productId);

    List<ProductListDTO> getProductsByCategory(Long categoryId);

    Map<Integer, FilterGroupDTO> getFilterOptions(Long categoryId);

    Page<ProductListDTO> filter(Long categoryId,
                                            String keyword,
                                            Map<String, List<String>> attributeFilters,
                                            Integer minPrice,
                                            Integer maxPrice,
                                            String sort,
                                            int page,
                                            int size);

    CompareResponse compareProducts(CompareRequest compareRequest);

}

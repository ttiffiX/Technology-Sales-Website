package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;

public interface CategoryPMServiceInterface {
    CategoryDTO addCategory(String name);

    CategoryDTO updateCategory(Long categoryId, String name);

    String deleteCategory(Long categoryId);
}


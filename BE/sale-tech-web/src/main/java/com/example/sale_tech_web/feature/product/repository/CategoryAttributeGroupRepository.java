package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryAttributeGroupRepository extends JpaRepository<CategoryAttributeGroup, Long> {
    List<CategoryAttributeGroup> findByCategoryIdOrderByGroupOrderAsc(Long categoryId);

    CategoryAttributeGroup findByIdAndCategoryId(Long id, Long categoryId);
}

package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryAttributeGroupRepository extends JpaRepository<CategoryAttributeGroup, Long> {
    List<CategoryAttributeGroup> findByCategoryIdOrderByGroupOrderAsc(Long categoryId);

    CategoryAttributeGroup findByIdAndCategoryId(Long id, Long categoryId);

    Boolean existsByCategoryIdAndName(Long categoryId, String name);

    @Query("SELECT MAX(g.groupOrder) FROM CategoryAttributeGroup g WHERE g.category.id = :categoryId")
    Integer findMaxGroupOrderByCategoryId(@Param("categoryId") Long categoryId);

    List<CategoryAttributeGroup> findByCategoryId(Long categoryId);
}

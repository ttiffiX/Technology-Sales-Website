package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryAttributeSchemaRepository extends JpaRepository<CategoryAttributeSchema, Long> {
    @Query("SELECT s FROM CategoryAttributeSchema s WHERE s.category.id = :categoryId " +
            "ORDER BY s.groupOrder ASC, s.displayOrder ASC")
    List<CategoryAttributeSchema> findByCategoryIdOrdered(@Param("categoryId") Long categoryId);

    CategoryAttributeSchema findByCategoryIdAndCode(Long categoryId, String code);

    Boolean existsByCategoryIdAndCode(Long categoryId, String code);

    Boolean existsByCategory(Category category);
}

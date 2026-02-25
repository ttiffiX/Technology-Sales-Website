package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.CategoryAttributeMapping;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryAttributeMappingRepository extends JpaRepository<CategoryAttributeMapping, Long> {

    // Get all filterable attributes for a category
    @EntityGraph(attributePaths = {
            "attribute"
    })
    @Query("SELECT cam FROM CategoryAttributeMapping cam WHERE cam.category.id = :categoryId AND cam.isFilterable = true")
    List<CategoryAttributeMapping> findFilterableAttributesByCategory(@Param("categoryId") Long categoryId);

    @EntityGraph(attributePaths = {
            "attribute"
    })
    @Query("SELECT cam FROM CategoryAttributeMapping cam WHERE cam.category.id = :categoryId ORDER BY cam.attribute.id")
    List<CategoryAttributeMapping> findAllByCategoryId(@Param("categoryId") Long categoryId);
}


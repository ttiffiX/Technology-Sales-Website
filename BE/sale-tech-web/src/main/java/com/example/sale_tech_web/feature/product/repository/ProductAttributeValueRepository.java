package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {

    // Get distinct values for a specific attribute in a category
    @Query("SELECT DISTINCT pav.value FROM ProductAttributeValue pav " +
           "WHERE pav.attribute.id = :attributeId " +
           "AND pav.product.category.id = :categoryId " +
           "AND pav.product.isActive = true " +
           "ORDER BY pav.value")
    List<String> findDistinctValuesByAttributeAndCategory(@Param("attributeId") Long attributeId,
                                                           @Param("categoryId") Long categoryId);
}


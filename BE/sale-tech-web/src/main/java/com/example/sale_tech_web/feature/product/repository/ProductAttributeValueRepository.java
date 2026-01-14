package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    @Query("SELECT pav FROM ProductAttributeValue pav " +
           "JOIN FETCH pav.attribute " +
           "WHERE pav.product.category.id = :categoryId " +
           "AND pav.product.isActive = true " +
           "ORDER BY pav.attribute.id, pav.value")
    List<ProductAttributeValue> findAllByCategory(@Param("categoryId") Long categoryId);
}
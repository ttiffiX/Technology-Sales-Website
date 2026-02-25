package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long> {
    @Query(
            "SELECT pa.name FROM ProductAttribute pa " +
                    "JOIN CategoryAttributeMapping cam ON pa.id = cam.attribute.id " +
                    "WHERE cam.category.id = :categoryId " +
                    "ORDER BY pa.id"
    )
    List<String> findByCategory(@Param("categoryId") Long categoryId);
}

package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Find products by category and active status
    @EntityGraph(attributePaths = {
            "category"
    })
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    // Find all active products
    @EntityGraph(attributePaths = {
            "category"
    })
    List<Product> findByIsActiveTrue();

    // Search products by title
    @EntityGraph(attributePaths = {
            "category"
    })
    @Query("SELECT p FROM Product p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.isActive = true")
    List<Product> searchByTitle(@Param("keyword") String keyword);

    // Find product by ID with all related data (for detail view) - prevent N+1
    @EntityGraph(attributePaths = {"category", "attributeValues", "attributeValues.attribute"})
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
}

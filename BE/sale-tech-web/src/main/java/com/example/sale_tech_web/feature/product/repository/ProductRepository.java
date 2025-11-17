package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by category and active status
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    // Find all active products
    List<Product> findByIsActiveTrue();

    // Search products by title
    @Query("SELECT p FROM Product p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.isActive = true")
    List<Product> searchByTitle(@Param("keyword") String keyword);

}

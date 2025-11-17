package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}


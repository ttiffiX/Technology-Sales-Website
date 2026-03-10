package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.dto.customer.FilterProjection;
import com.example.sale_tech_web.feature.product.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    // Find all active products
    @EntityGraph(attributePaths = {
            "category"
    })
    List<Product> findByIsActiveTrue();

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByIsActiveTrueAndTitleContainingIgnoreCase(String keyword);

    @Query(value = """
             SELECT\s
                 cas.code AS code,\s
                 jsonb_agg(DISTINCT attr.value ORDER BY attr.value) AS values
             FROM category_attribute_schema cas
             JOIN product p ON cas.category_id = p.category_id
             CROSS JOIN LATERAL jsonb_each_text(p.attributes) AS attr
             WHERE cas.category_id = :categoryId
               AND cas.is_filterable = true
               AND p.is_active = true
               AND attr.key = cas.code
             GROUP BY cas.code
            \s""", nativeQuery = true)
    List<FilterProjection> findAllFilterValuesAggregated(@Param("categoryId") Long categoryId);

    List<Product> findByIdInAndIsActiveTrue(List<Long> ids);

}

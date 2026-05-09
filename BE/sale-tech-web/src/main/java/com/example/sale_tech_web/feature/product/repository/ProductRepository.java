package com.example.sale_tech_web.feature.product.repository;

import com.example.sale_tech_web.feature.product.dto.customer.FilterProjection;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    // Find top 10 best-selling active products for each category
    @Query(value = """
            SELECT p.* FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY quantity_sold DESC) as rank
                FROM product
                WHERE is_active = true
            ) p
            WHERE p.rank <= 10
            """, nativeQuery = true)
    List<Product> findTop10ByEachCategoryAndIsActiveTrue();

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    /*
    lấy tất cả giá trị của các thuộc tính filterable trong category, đã được gộp lại thành 1 list duy nhất
    nếu là String thì lấy giá trị đó, nếu là Array thì lấy tất cả phần tử trong array đó
    */
    @Query(value = """
            SELECT\s
                cas.code AS code,\s
                jsonb_agg(DISTINCT val.element ORDER BY val.element) AS values
            FROM category_attribute_schema cas
            JOIN product p ON cas.category_id = p.category_id
            CROSS JOIN LATERAL jsonb_extract_path(p.attributes, cas.code) AS raw_val
            CROSS JOIN LATERAL (
                SELECT x AS element\s
                FROM jsonb_array_elements_text(
                    CASE\s
                        WHEN jsonb_typeof(raw_val) = 'array' THEN raw_val\s
                        ELSE jsonb_build_array(raw_val)\s
                    END
                ) x
            ) AS val
            WHERE cas.category_id = :categoryId
              AND cas.is_filterable = true
              AND p.is_active = true
            GROUP BY cas.code
            \s""", nativeQuery = true)
    List<FilterProjection> findAllFilterValuesAggregated(@Param("categoryId") Long categoryId);

    List<Product> findByIdInAndIsActiveTrue(List<Long> ids);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            UPDATE Product p
            SET p.quantity = p.quantity - :quantity,
                p.quantitySold = COALESCE(p.quantitySold, 0) + :quantity
            WHERE p.id = :productId
              AND p.isActive = true
              AND p.quantity IS NOT NULL
              AND p.quantity >= :quantity
            """)
    int decrementStockIfAvailable(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            UPDATE Product p
            SET p.quantity = COALESCE(p.quantity, 0) + :quantity,
                p.quantitySold = COALESCE(p.quantitySold, 0) - :quantity
            WHERE p.id = :productId
            """)
    void incrementStockOnRevert(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE " +
            "(CAST(:kw AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:kw AS string), '%'))) AND " +
            "(:cateId IS NULL OR p.category.id = :cateId) AND " +
            "(:active IS NULL OR p.isActive = :active) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findProductsCustom(
            @Param("kw") String keyword,
            @Param("cateId") Integer categoryId,
            @Param("active") Boolean isActive,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            Pageable pageable);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM product " +
            "WHERE category_id = :categoryId " +
            "AND jsonb_exists(attributes, :attributeCode))", nativeQuery = true)
    boolean existsByAttributeCodeAndCategoryId(@Param("attributeCode") String attributeCode, @Param("categoryId") Long categoryId);

    boolean existsByCategory(Category category);
}

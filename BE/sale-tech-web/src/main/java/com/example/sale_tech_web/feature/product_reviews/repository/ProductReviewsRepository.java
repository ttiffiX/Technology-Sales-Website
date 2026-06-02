package com.example.sale_tech_web.feature.product_reviews.repository;

import com.example.sale_tech_web.feature.product_reviews.entity.ProductReviews;
import com.example.sale_tech_web.feature.product_reviews.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductReviewsRepository extends JpaRepository<ProductReviews, Long> {

    @Query("""
            SELECT COUNT(r) FROM ProductReviews r
            WHERE r.product.id = :productId
              AND r.parentId IS NULL
              AND r.rating IS NOT NULL
              AND r.isDeleted = false
            """)
    long countRootReviews(@Param("productId") Long productId);

    @Query("""
            SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM ProductReviews r
            WHERE r.product.id = :productId
              AND r.parentId IS NULL
              AND r.rating IS NOT NULL
              AND r.isDeleted = false
            """)
    Double getAverageRating(@Param("productId") Long productId);

    @Query("""
            SELECT r.rating, COUNT(r)
            FROM ProductReviews r
            WHERE r.product.id = :productId
              AND r.parentId IS NULL
              AND r.rating IS NOT NULL
              AND r.isDeleted = false
            GROUP BY r.rating
            """)
    List<Object[]> countRootRatingsGrouped(@Param("productId") Long productId);


    @EntityGraph(attributePaths = {"user", "product", "user.cart"})
    @Query("""
            SELECT r FROM ProductReviews r
            WHERE r.product.id = :productId
              AND r.parentId IS NULL
              AND r.comment IS NOT NULL
              AND (:rating IS NULL OR r.rating = :rating)
              AND r.isDeleted = false
            """)
    Page<ProductReviews> findRootCommentsByProductId(
            @Param("productId") Long productId,
            @Param("rating") Integer rating,
            Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
            SELECT r FROM ProductReviews r
            WHERE r.parentId IN :parentIds
                AND r.isDeleted = false
            ORDER BY r.parentId ASC, r.createdAt ASC
            """)
    List<ProductReviews> findRepliesByParentIds(@Param("parentIds") Collection<Long> parentIds);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
            SELECT r FROM ProductReviews r
            WHERE r.parentId IN :parentIds
            ORDER BY r.parentId ASC, r.createdAt ASC
            """)
    List<ProductReviews> findRepliesByParentIdsPM(@Param("parentIds") Collection<Long> parentIds);


    boolean existsByProductIdAndUserIdAndParentIdIsNull(Long productId, Long userId);

    @EntityGraph(attributePaths = {"user", "product"})
    @Query("""
            SELECT r FROM ProductReviews r
            WHERE r.id = :reviewId
              AND r.parentId IS NULL
              AND r.isDeleted = false
            """)
    Optional<ProductReviews> findRootReviewById(@Param("reviewId") Long reviewId);

    @EntityGraph(attributePaths = {"user", "product", "user.cart"})
    @Query("""
            SELECT r FROM ProductReviews r\s
            JOIN r.product p
            WHERE r.parentId IS NULL\s
              AND (CAST(:kw AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:kw AS string), '%')))
              AND (:star IS NULL OR r.rating = :star)
              AND (:status IS NULL OR r.processStatus = :status)
              AND (:isDeleted IS NULL OR r.isDeleted = :isDeleted)
            \s""")
    Page<ProductReviews> findAllReviewsForManager(
            @Param("kw") String keyword,
            @Param("star") Integer star,
            @Param("status") ReviewStatus status,
            @Param("isDeleted") Boolean isDeleted,
            Pageable pageable
    );
    Boolean existsByParentId(Long parentId);

    @EntityGraph(attributePaths = {"user", "product", "user.cart"})
    @Query("""
            SELECT r FROM ProductReviews r\s
            WHERE r.id = :reviewId\s
             AND r.isDeleted = false
            \s""")
    Optional<ProductReviews> findByReviewId(@Param("reviewId") Long reviewId);
}
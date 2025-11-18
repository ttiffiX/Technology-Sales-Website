package com.example.sale_tech_web.feature.product.manager;

import com.example.sale_tech_web.controller.exception.ServerException;
import com.example.sale_tech_web.feature.product.dto.*;
import com.example.sale_tech_web.feature.product.entity.*;
import com.example.sale_tech_web.feature.product.repository.*;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService implements ProductServiceInterface {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeMappingRepository categoryAttributeMappingRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final EntityManager entityManager;

    /**
     * Get all categories
     */
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> CategoryDTO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get all active products with basic info for listing
     */
    public List<ProductListDTO> getAllProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return products.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get product detail by ID with full information
     */
    public ProductDetailDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ServerException("Product not found"));
        return convertToDetailDTO(product);
    }

    /**
     * Get filter options for a category (tất cả attributes có thể filter và giá trị của chúng)
     */
    public CategoryFilterOptionsDTO getFilterOptions(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ServerException("Category not found"));

        // Get all filterable attributes for this category
        List<CategoryAttributeMapping> mappings = categoryAttributeMappingRepository
                .findFilterableAttributesByCategory(categoryId);

        // For each attribute, get all distinct values
        List<FilterAttributeDTO> filterAttributes = mappings.stream()
                .map(mapping -> {
                    ProductAttribute attr = mapping.getAttribute();
                    List<String> values = productAttributeValueRepository
                            .findDistinctValuesByAttributeAndCategory(attr.getId(), categoryId);

                    return FilterAttributeDTO.builder()
                            .attributeId(attr.getId())
                            .attributeName(attr.getName())
                            .unit(attr.getUnit())
                            .availableValues(values)
                            .build();
                })
                .collect(Collectors.toList());

        return CategoryFilterOptionsDTO.builder()
                .categoryId(categoryId)
                .categoryName(category.getName())
                .filterableAttributes(filterAttributes)
                .build();
    }

    /**
     * Filter products by dynamic attributes and sort by price (asc/desc)
     * @param categoryId Category ID (required)
     * @param attributeFilters Map<attributeId, List<values>> - ví dụ: {1: ["8", "16"], 3: ["15.6"]}
     * @param minPrice Minimum price (optional)
     * @param maxPrice Maximum price (optional)
     * @param sort Sort direction: price_asc | price_desc (default price_asc if null/invalid)
     */
    public List<ProductListDTO> filterByAttributes(Long categoryId,
                                                   Map<Long, List<String>> attributeFilters,
                                                   Integer minPrice,
                                                   Integer maxPrice,
                                                   String sort) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> product = query.from(Product.class);

        List<Predicate> predicates = new ArrayList<>();

        // Always filter by category and active status
        predicates.add(cb.equal(product.get("category").get("id"), categoryId));
        predicates.add(cb.isTrue(product.get("isActive")));

        // Price range filter
        if (minPrice != null) {
            predicates.add(cb.greaterThanOrEqualTo(product.get("price"), minPrice));
        }
        if (maxPrice != null) {
            predicates.add(cb.lessThanOrEqualTo(product.get("price"), maxPrice));
        }

        // Dynamic attribute filters
        if (attributeFilters != null && !attributeFilters.isEmpty()) {
            for (Map.Entry<Long, List<String>> entry : attributeFilters.entrySet()) {
                Long attributeId = entry.getKey();
                List<String> values = entry.getValue();

                if (values != null && !values.isEmpty()) {
                    // Subquery: product must have this attribute with one of the specified values
                    Subquery<Long> subquery = query.subquery(Long.class);
                    Root<ProductAttributeValue> attrValue = subquery.from(ProductAttributeValue.class);
                    subquery.select(attrValue.get("product").get("id"));
                    subquery.where(
                        cb.and(
                            cb.equal(attrValue.get("product").get("id"), product.get("id")),
                            cb.equal(attrValue.get("attribute").get("id"), attributeId),
                            attrValue.get("value").in(values)
                        )
                    );
                    predicates.add(cb.exists(subquery));
                }
            }
        }

        query.where(predicates.toArray(new Predicate[0]));
        query.distinct(true);

        // Sorting by price only
        boolean desc = sort != null && sort.equalsIgnoreCase("price_desc");
        query.orderBy(desc ? cb.desc(product.get("price")) : cb.asc(product.get("price")));

        List<Product> products = entityManager.createQuery(query).getResultList();

        return products.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get products by category
     */
    public List<ProductListDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        return products.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search products by keyword in title
     */
    public List<ProductListDTO> searchProducts(String keyword) {
        List<Product> products = productRepository.searchByTitle(keyword);
        return products.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Product entity to ProductListDTO (for listing)
     */
    private ProductListDTO convertToListDTO(Product product) {
        return ProductListDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .price(product.getPrice())
                .quantitySold(product.getQuantitySold() != null ? product.getQuantitySold() : 0)
                .imageUrl(product.getImageUrl())
                .stocked(product.getStocked())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .build();
    }

    /**
     * Convert Product entity to ProductDetailDTO (for detail view)
     */
    private ProductDetailDTO convertToDetailDTO(Product product) {
        // Convert attributes to map
        Map<String, String> attributesMap = new HashMap<>();
        if (product.getAttributeValues() != null) {
            for (ProductAttributeValue attrValue : product.getAttributeValues()) {
                if (attrValue.getAttribute() != null) {
                    String attrName = attrValue.getAttribute().getName();
                    String unit = attrValue.getAttribute().getUnit();
                    String value = attrValue.getValue();

                    // Format: "value unit" or just "value" if no unit
                    String formattedValue = unit != null && !unit.isEmpty()
                            ? value + " " + unit
                            : value;

                    attributesMap.put(attrName, formattedValue);
                }
            }
        }

        return ProductDetailDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantitySold(product.getQuantitySold() != null ? product.getQuantitySold() : 0)
                .imageUrl(product.getImageUrl())
                .stocked(product.getStocked())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .attributes(attributesMap)
                .build();
    }
}

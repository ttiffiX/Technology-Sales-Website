package com.example.sale_tech_web.feature.product.manager;

import static org.springframework.http.HttpStatus.*;

import com.example.sale_tech_web.feature.product.dto.*;
import com.example.sale_tech_web.feature.product.entity.*;
import com.example.sale_tech_web.feature.product.repository.*;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService implements ProductServiceInterface {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeMappingRepository categoryAttributeMappingRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final EntityManager entityManager;
    private final ProductAttributeRepository productAttributeRepository;

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
        Product product = productRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return convertToDetailDTO(product);
    }

    /**
     * Get filter options for a category (tất cả attributes có thể filter và giá trị của chúng)
     */
    public CategoryFilterOptionsDTO getFilterOptions(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        // Get all filterable attributes for this category
        List<CategoryAttributeMapping> mappings = categoryAttributeMappingRepository
                .findFilterableAttributesByCategory(categoryId);

        //Get ALL attribute values for this category in ONE query
        List<ProductAttributeValue> allAttributeValues = productAttributeValueRepository
                .findAllByCategory(categoryId);

        // Group attribute values by attributeId and get distinct values
        Map<Long, List<String>> attributeValuesMap = allAttributeValues.stream()
                .collect(Collectors.groupingBy(
                        pav -> pav.getAttribute().getId(),
                        Collectors.mapping(
                                ProductAttributeValue::getValue,
                                Collectors.collectingAndThen(
                                        Collectors.toSet(),
                                        set -> set.stream().sorted().collect(Collectors.toList())
                                )
                        )
                ));

        // Build filter attributes DTOs - only for filterable attributes
        List<FilterAttributeDTO> filterAttributes = mappings.stream()
                .map(mapping -> {
                    ProductAttribute attr = mapping.getAttribute();
                    List<String> values = attributeValuesMap.getOrDefault(attr.getId(), List.of());

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
     *
     * @param categoryId       Category ID (required)
     * @param attributeFilters Map<attributeId, List<values>> - ví dụ: {1: ["8", "16"], 3: ["15.6"]}
     * @param minPrice         Minimum price (optional)
     * @param maxPrice         Maximum price (optional)
     * @param sort             Sort direction: price_asc | price_desc (default price_asc if null/invalid)
     */
    public List<ProductListDTO> filterByAttributes(Long categoryId,
                                                   Map<Long, List<String>> attributeFilters,
                                                   Integer minPrice,
                                                   Integer maxPrice,
                                                   String sort) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> product = query.from(Product.class);

        // Eager fetch category to prevent N+1
        product.fetch("category", JoinType.LEFT);

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
     * Compare multiple products (max 3)
     * Returns all common attributes across products for comparison
     */
    public CompareResponse compareProducts(CompareRequest compareRequest) {
        List<Long> productIds = compareRequest.getProductIds();
        Long categoryId = compareRequest.getCategoryId();

        List<Product> fetchedProducts = productRepository.findAllByIdWithDetails(productIds);

        for (Product product : fetchedProducts) {
            if (!product.getCategory().getId().equals(categoryId)) {
                throw new ResponseStatusException(BAD_REQUEST, "All products must belong to the specified category");
            }
        }

        // Check if all products exist
        if (fetchedProducts.size() != productIds.size()) {
            throw new ResponseStatusException(NOT_FOUND, "One or more products not found");
        }

        List<String> allAttributes = productAttributeRepository.findByCategory(categoryId);

        List<ProductDetailDTO> productDetails = fetchedProducts.stream()
                .map(this::convertToDetailDTO)
                .toList();

        return CompareResponse.builder()
                .attributeNames(allAttributes)
                .products(productDetails)
                .build();
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
        // Convert attributes to map - use LinkedHashMap to maintain order
        // Group multiple values for same attribute (e.g., "Kiểu kết nối" can have multiple values)
        Map<String, String> attributesMap = new LinkedHashMap<>();

        if (product.getAttributeValues() != null) {
            // Group by attribute name and collect all values
            Map<String, List<ProductAttributeValue>> groupedByAttribute = product.getAttributeValues().stream()
                    .filter(attrValue -> attrValue.getAttribute() != null)
                    .sorted(Comparator.comparing(av -> av.getAttribute().getId()))
                    .collect(Collectors.groupingBy(
                            av -> av.getAttribute().getName(),
                            LinkedHashMap::new,
                            Collectors.toList()
                    ));

            // For each attribute, combine all values
            groupedByAttribute.forEach((attrName, attrValues) -> {
                String unit = attrValues.getFirst().getAttribute().getUnit();

                // Collect and join all values for this attribute
                String combinedValue = attrValues.stream()
                        .map(ProductAttributeValue::getValue)
                        .collect(Collectors.joining(", "));

                // Format: "value unit" or just "value" if no unit
                String formattedValue = unit != null && !unit.isEmpty()
                        ? combinedValue + " " + unit
                        : combinedValue;

                attributesMap.put(attrName, formattedValue);
            });
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

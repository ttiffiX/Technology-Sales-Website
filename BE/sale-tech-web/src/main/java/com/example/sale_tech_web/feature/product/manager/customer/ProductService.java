package com.example.sale_tech_web.feature.product.manager.customer;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.customer.*;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ProductService implements ProductServiceInterface {
    @Autowired
    private ObjectMapper objectMapper;

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryAttributeSchemaRepository schemaRepository;

    @Override
    @Cacheable(CacheNames.CATEGORIES)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDTO.builder().id(c.getId()).name(c.getName()).build())
                .toList();
    }

    @Override
    @Cacheable(CacheNames.PRODUCT_LIST_ALL)
    public List<ProductListDTO> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::convertToListDTO)
                .toList();
    }

    @Override
    @Cacheable(value = CacheNames.PRODUCT_BY_ID, key = "#productId")
    public ProductDetailDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return convertToDetailDTO(product);
    }

    @Override
    @Cacheable(value = CacheNames.FILTER_OPTIONS, key = "#categoryId")
        public Map<Integer, FilterGroupDTO> getFilterOptions(Long categoryId) {
        List<CategoryAttributeSchema> schemas = schemaRepository.findByCategoryIdOrdered(categoryId);
        Map<String, List<String>> attributeValuesMap = getFilterValuesMap(categoryId);

        Map<Integer, FilterGroupDTO> groups = new LinkedHashMap<>();

        schemas.stream()
                .filter(s -> attributeValuesMap.containsKey(s.getCode()))
                .forEach(s -> {
                    CategoryAttributeGroup group = s.getCategoryAttributeGroup();
                    if (group == null) {
                        return;
                    }

                    FilterGroupDTO groupDTO = groups.computeIfAbsent(group.getGroupOrder(), _ ->
                            FilterGroupDTO.builder()
                                    .groupName(group.getName())
                                    .filterAttributes(new ArrayList<>())
                                    .build()
                    );

                    FilterGroupDTO.FilterAttributeDTO attrDTO = FilterGroupDTO.FilterAttributeDTO.builder()
                            .code(s.getCode())
                            .attributeName(s.getName())
                            .unit(s.getUnit())
                            .availableValues(attributeValuesMap.get(s.getCode()))
                            .build();

                    groupDTO.getFilterAttributes().add(attrDTO);
                });

        return groups;
    }

    @Override
    public List<ProductListDTO> filterByAttributes(Long categoryId, Map<String, List<String>> attributeFilters, Integer minPrice, Integer maxPrice, String sort) {

        // 1. Khởi tạo Specification cơ bản
        // Lưu ý: Đảm bảo Entity Product có field 'category' và 'isActive' (đúng hoa thường)
        Specification<Product> spec = Specification.where((root, _, cb) ->
                cb.and(
                        cb.equal(root.get("category").get("id"), categoryId),
                        cb.isTrue(root.get("isActive"))
                )
        );

        // 2. Lọc theo giá
        if (minPrice != null)
            spec = spec.and((root, _, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null) spec = spec.and((root, _, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));

        // 3. Lọc JSONB: xử lý cả scalar lẫn array
        // - Scalar: jsonb_extract_path_text(attributes, key) IN (values)
        // - Array:  jsonb_path_exists(attributes, '$.key[*] ? (@ == "v1" || @ == "v2")')
        // Dùng OR của cả 2 để Postgres tự chọn đúng theo kiểu thực tế của field
        if (attributeFilters != null && !attributeFilters.isEmpty()) {
            for (Map.Entry<String, List<String>> entry : attributeFilters.entrySet()) {
                String key = entry.getKey();
                List<String> values = entry.getValue();

                spec = spec.and((root, _, cb) -> {
                    // Scalar predicate
                    var scalarPredicate = cb.function(
                            "jsonb_extract_path_text", String.class,
                            root.get("attributes"), cb.literal(key)
                    ).in(values);

                    // Array predicate — jsonb_path_exists với OR của tất cả values
                    String jsonPath = "$.\"" + key + "\"[*] ? (" +
                            values.stream()
                                    .map(v -> "@ == \"" + v + "\"")
                                    .collect(Collectors.joining(" || "))
                            + ")";
                    var arrayPredicate = cb.isTrue(
                            cb.function("jsonb_path_exists", Boolean.class,
                                    root.get("attributes"),
                                    cb.literal(jsonPath))
                    );

                    return cb.or(scalarPredicate, arrayPredicate);
                });
            }
        }

        // 4. Xử lý Sắp xếp linh hoạt hơn
        Sort sortOrder;
        switch (sort) {
            case "price_asc" -> sortOrder = Sort.by("price").ascending();
            case "price_desc" -> sortOrder = Sort.by("price").descending();
            default -> sortOrder = Sort.by("id").descending(); // Mặc định sản phẩm mới lên đầu
        }

        return productRepository.findAll(spec, sortOrder).stream()
                .map(this::convertToListDTO)
                .toList();
    }


    @Override
    @Cacheable(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#categoryId")
    public List<ProductListDTO> getProductsByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::convertToListDTO)
                .toList();
    }

    @Override
    @Cacheable(value = CacheNames.PRODUCT_SEARCH, key = "#keyword == null ? 'ALL' : #keyword.trim().toLowerCase()")
    public List<ProductListDTO> searchProducts(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllProducts();
        }
        return productRepository.findByIsActiveTrueAndTitleContainingIgnoreCase(keyword.trim()).stream()
                .map(this::convertToListDTO)
                .toList();
    }

    @Override
    public CompareResponse compareProducts(CompareRequest compareRequest) {
        List<Long> productIds = compareRequest.getProductIds();
        Long categoryId = compareRequest.getCategoryId();

        List<Product> fetchedProducts = productRepository.findByIdInAndIsActiveTrue(productIds);

        for (Product product : fetchedProducts) {
            if (!product.getCategory().getId().equals(categoryId)) {
                throw new ResponseStatusException(BAD_REQUEST, "All products must belong to the specified category");
            }
        }

        // Check if all products exist
        if (fetchedProducts.size() != productIds.size()) {
            throw new ResponseStatusException(NOT_FOUND, "One or more products not found");
        }

        List<CategoryAttributeSchema> schemas = schemaRepository.findByCategoryIdOrdered(categoryId);
        List<CompareResponse.AttributeValueDTO> allAttributes = schemas.stream()
                .map(s -> new CompareResponse.AttributeValueDTO(s.getCode(), s.getName()))
                .toList();

        List<CompareDTO> productCompare = new ArrayList<>();
        for (Product product : fetchedProducts) {
            productCompare.add(CompareDTO.builder()
                    .id(product.getId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .imageUrl(product.getImageUrl())
                    .categoryName(product.getCategory().getName())
                    .rawAttributes(product.getAttributes())
                    .build());
        }


        return CompareResponse.builder()
                .attributeNames(allAttributes)
                .products(productCompare)
                .build();
    }

    private ProductListDTO convertToListDTO(Product product) {
        return ProductListDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .build();
    }

    private ProductDetailDTO convertToDetailDTO(Product product) {
        Long catId = product.getCategory().getId();
        Map<String, Object> raw = product.getAttributes();

        List<CategoryAttributeSchema> schemas = schemaRepository.findByCategoryIdOrdered(catId);

        Map<Integer, ProductFilterGroupDTO> attributes = new LinkedHashMap<>();
        for (CategoryAttributeSchema s : schemas) {
            CategoryAttributeGroup group = s.getCategoryAttributeGroup();
            if (group == null) {
                continue;
            }

            Object value = raw.get(s.getCode());
            if (value == null) continue;

            ProductFilterGroupDTO.AttributeDTO attrDTO = ProductFilterGroupDTO.AttributeDTO.builder()
                    .attributeName(s.getName())
                    .unit(s.getUnit())
                    .availableValues(value)
                    .build();

            ProductFilterGroupDTO groupDTO = attributes.computeIfAbsent(group.getGroupOrder(), _ -> {
                ProductFilterGroupDTO newGroup = new ProductFilterGroupDTO();
                newGroup.setGroupName(group.getName());
                newGroup.setFilterAttributes(new ArrayList<>());
                return newGroup;
            });

            groupDTO.getFilterAttributes().add(attrDTO);
        }

        return ProductDetailDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .categoryId(catId)
                .categoryName(product.getCategory().getName())
                .attributes(attributes)
                .build();
    }

    private Map<String, List<String>> getFilterValuesMap(Long categoryId) {
        List<FilterProjection> rawData = productRepository.findAllFilterValuesAggregated(categoryId);

        return rawData.stream().collect(Collectors.toMap(
                FilterProjection::getCode,
                p -> {
                    try {
                        List<String> list = objectMapper.readValue(p.getValues(), new TypeReference<>() {
                        });

                        return list.stream()
                                .filter(val -> val != null && !val.trim().isEmpty())
                                .toList();
                    } catch (Exception e) {
                        return Collections.emptyList();
                    }
                }
        ));
    }
}

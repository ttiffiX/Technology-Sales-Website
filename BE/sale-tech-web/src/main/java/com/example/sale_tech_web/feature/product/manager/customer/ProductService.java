package com.example.sale_tech_web.feature.product.manager.customer;

import com.example.sale_tech_web.feature.product.dto.customer.*;
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
    @Cacheable("categories")
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDTO.builder().id(c.getId()).name(c.getName()).build())
                .toList();
    }

    @Override
    public List<ProductListDTO> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::convertToListDTO)
                .toList();
    }

    @Override
    public ProductDetailDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return convertToDetailDTO(product);
    }

    @Override
    @Cacheable(value = "filterOptions", key = "#categoryId")
    public Map<Integer, FilterGroupDTO> getFilterOptions(Long categoryId) {
        List<CategoryAttributeSchema> schemas = schemaRepository.findByCategoryIdOrdered(categoryId);
        Map<String, List<String>> attributeValuesMap = getFilterValuesMap(categoryId);

        Map<Integer, FilterGroupDTO> groups = new LinkedHashMap<>();

        schemas.stream()
                .filter(s -> attributeValuesMap.containsKey(s.getCode()))
                .forEach(s -> {
                    FilterGroupDTO group = groups.computeIfAbsent(s.getGroupOrder(), order ->
                            FilterGroupDTO.builder()
                                    .groupName(s.getGroupName())
                                    .filterAttributes(new ArrayList<>())
                                    .build()
                    );

                    FilterGroupDTO.FilterAttributeDTO attrDTO = FilterGroupDTO.FilterAttributeDTO.builder()
                            .code(s.getCode())
                            .attributeName(s.getName())
                            .unit(s.getUnit())
                            .availableValues(attributeValuesMap.get(s.getCode()))
                            .build();

                    group.getFilterAttributes().add(attrDTO);
                });

        return groups;

    }

    @Override
    public List<ProductListDTO> filterByAttributes(Long categoryId, Map<String, List<String>> attributeFilters, Integer minPrice, Integer maxPrice, String sort) {

        // 1. Khởi tạo Specification cơ bản
        // Lưu ý: Đảm bảo Entity Product có field 'category' và 'isActive' (đúng hoa thường)
        Specification<Product> spec = Specification.where((root, query, cb) ->
                cb.and(
                        cb.equal(root.get("category").get("id"), categoryId),
                        cb.isTrue(root.get("isActive"))
                )
        );

        // 2. Lọc theo giá
        if (minPrice != null)
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null) spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));

        // 3. Lọc JSONB: Dùng function để Postgres bóc tách text từ JSONB
        if (attributeFilters != null && !attributeFilters.isEmpty()) {
            for (Map.Entry<String, List<String>> entry : attributeFilters.entrySet()) {
                spec = spec.and((root, query, cb) ->
                        cb.function("jsonb_extract_path_text", String.class,
                                        root.get("attributes"), cb.literal(entry.getKey()))
                                .in(entry.getValue())
                );
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
    public List<ProductListDTO> getProductsByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::convertToListDTO)
                .toList();
    }

    @Override
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
                .quantitySold(product.getQuantitySold())
                .imageUrl(product.getImageUrl())
                .stocked(product.getStocked())
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
            Object value = raw.get(s.getCode());
            if (value == null) continue;

            ProductFilterGroupDTO.AttributeDTO attrDTO = ProductFilterGroupDTO.AttributeDTO.builder()
                    .attributeName(s.getName())
                    .unit(s.getUnit())
                    .availableValues(value)
                    .build();

            attributes.computeIfAbsent(s.getGroupOrder(), key -> {
                ProductFilterGroupDTO newGroup = new ProductFilterGroupDTO();
                newGroup.setGroupName(s.getGroupName());
                newGroup.setFilterAttributes(new ArrayList<>());
                return newGroup;
            });

            attributes.get(s.getGroupOrder()).getFilterAttributes().add(attrDTO);
        }

        return ProductDetailDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantitySold(product.getQuantitySold())
                .imageUrl(product.getImageUrl())
                .stocked(product.getStocked())
                .categoryId(catId)
                .categoryName(product.getCategory().getName())
                .attributes(attributes)
                .build();
    }

    public Map<String, List<String>> getFilterValuesMap(Long categoryId) {
        List<FilterProjection> rawData = productRepository.findAllFilterValuesAggregated(categoryId);

        return rawData.stream().collect(Collectors.toMap(
                FilterProjection::getCode,
                p -> {
                    try {
                        // Chuyển trực tiếp thành List<String>
                        return objectMapper.readValue(p.getValues(), new TypeReference<List<String>>() {
                        });
                    } catch (Exception e) {
                        // Log lỗi nếu cần thiết
                        return Collections.emptyList();
                    }
                }
        ));
    }
}



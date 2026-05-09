package com.example.sale_tech_web.feature.product.manager.pm;

import com.alibaba.excel.EasyExcel;
import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.feature.cloudinary.dto.CloudinaryResponse;
import com.example.sale_tech_web.feature.cloudinary.manager.CloudinaryService;
import com.example.sale_tech_web.feature.product.dto.customer.ProductFilterGroupDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductDetailDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.PMProductListDTO;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductRequest;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeGroup;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static com.example.sale_tech_web.feature.product.utils.Validate.validateProductAttributes;

@Service
@RequiredArgsConstructor
@Slf4j
public class PMService implements PMServiceInterface {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    private CacheManager cacheManager;


    @Override
    public Page<PMProductListDTO> getAllProductsForPM(String keyword, Integer categoryId, Boolean isActive,
                                                      Integer minPrice, Integer maxPrice, Pageable pageable) {
        Page<Product> productPage = productRepository.findProductsCustom(
                keyword, categoryId, isActive, minPrice, maxPrice, pageable);

        return productPage.map(this::toListDTO);
    }

    @Override
    public PMProductDetailDTO getProductDetailForPM(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        return convertToDetailDTO(product);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public PMProductListDTO addProduct(ProductRequest request, MultipartFile file) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        List<CategoryAttributeSchema> schemas =
                categoryAttributeSchemaRepository.findByCategoryIdOrdered(category.getId());

        if (schemas.isEmpty()) {
            throw new BadRequestException(
                    "No attribute schema configured for category id=" + category.getId());
        }

        Map<String, Object> finalAttributes = validateProductAttributes(schemas, request.getAttributes());

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .quantitySold(request.getQuantitySold() == null ? 0 : request.getQuantitySold())
                .isActive(request.getIsActive())
                .category(category)
                .attributes(finalAttributes)
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        if (file != null && !file.isEmpty()) {
            try {
                CloudinaryResponse uploadResult = cloudinaryService.uploadImage(file, category.getName());
                savedProduct.setImageUrl(uploadResult.getImageUrl());
                savedProduct.setPublicId(uploadResult.getPublicId());

                productRepository.save(savedProduct);
            } catch (IOException e) {
                // Rollback thủ công hoặc ném exception để @Transactional tự rollback
                throw new BadRequestException("Upload image failed: " + e.getMessage());
            }
        } else {
            // Xử lý mặc định nếu không có ảnh
            savedProduct.setImageUrl("default_image_url.png");
            productRepository.save(savedProduct);
        }

        return toListDTO(savedProduct);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#categoryId"),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId"),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String addProductByExcel(Long categoryId, MultipartFile file) throws IOException {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        List<CategoryAttributeSchema> schemas =
                categoryAttributeSchemaRepository.findByCategoryIdOrdered(category.getId());

        if (schemas.isEmpty()) {
            throw new BadRequestException(
                    "No attribute schema configured for category id=" + category.getId());
        }

        EasyExcel.read(file.getInputStream(),
                        new ProductImportListener(productRepository, schemas, cloudinaryService, category))
                .sheet()
                .doRead();

        return "Import complete!";
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#request.categoryId"),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#request.categoryId")
    })
    public PMProductDetailDTO updateProduct(Long productId, ProductRequest request, MultipartFile file) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        Category category = existing.getCategory();

        List<CategoryAttributeSchema> schemas =
                categoryAttributeSchemaRepository.findByCategoryIdOrdered(category.getId());

        if (schemas.isEmpty()) {
            throw new BadRequestException(
                    "No attribute schema configured for category id=" + category.getId());
        }

        Map<String, Object> finalAttributes = validateProductAttributes(schemas, request.getAttributes());

        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setQuantity(request.getQuantity());
        existing.setQuantitySold(request.getQuantitySold() == null ? 0 : request.getQuantitySold());
        existing.setIsActive(request.getIsActive());
        existing.setAttributes(finalAttributes);

        String oldPublicId = null;

        if (file != null && !file.isEmpty()) {
            try {
                oldPublicId = existing.getPublicId();

                CloudinaryResponse uploadResult = cloudinaryService.uploadImage(file, category.getName());
                existing.setImageUrl(uploadResult.getImageUrl());
                existing.setPublicId(uploadResult.getPublicId());

            } catch (IOException e) {
                throw new BadRequestException("Upload image failed: " + e.getMessage());
            }
        }

        Product saved = productRepository.save(existing);

        if (oldPublicId != null) {
            try {
                cloudinaryService.deleteImage(oldPublicId);
            } catch (IOException e) {
                log.error("Failed to delete image from Cloudinary for product ID {}: {}", productId, e.getMessage());
            }
        }

        return convertToDetailDTO(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String updateState(Long productId, boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (product.getIsActive() == active) {
            return "Product is already " + (active ? "active" : "inactive") + ". No changes made.";
        }

        product.setIsActive(active);
        productRepository.save(product);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.PRODUCT_BY_CATEGORY)).evict(product.getCategory().getId());
        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(product.getCategory().getId());

        return "Product with ID " + productId + " has been deactivated.";
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT_BY_ID, key = "#productId"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST_ALL, allEntries = true),
            @CacheEvict(value = CacheNames.PRODUCT_SEARCH, allEntries = true)
    })
    public String deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        String result = "Product with ID " + productId + " has been deleted.";

        try {
            if (product.getPublicId() != null) {
                cloudinaryService.deleteImage(product.getPublicId());
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary for product ID {}: {}", productId, e.getMessage());
            result += " However, the associated image could not be deleted.";
        }

        productRepository.delete(product);

        Objects.requireNonNull(cacheManager.getCache(CacheNames.PRODUCT_BY_CATEGORY)).evict(product.getCategory().getId());
        Objects.requireNonNull(cacheManager.getCache(CacheNames.FILTER_OPTIONS)).evict(product.getCategory().getId());

        return result;
    }

    private PMProductListDTO toListDTO(Product p) {
        return PMProductListDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .price(p.getPrice())
                .isActive(p.getIsActive())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .quantity(p.getQuantity())
                .build();
    }

    private PMProductDetailDTO convertToDetailDTO(Product product) {
        Long catId = product.getCategory().getId();
        Map<String, Object> raw = product.getAttributes();

        List<CategoryAttributeSchema> schemas = categoryAttributeSchemaRepository.findByCategoryIdOrdered(catId);

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

        return PMProductDetailDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .quantitySold(product.getQuantitySold())
                .quantity(product.getQuantity())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .categoryId(catId)
                .categoryName(product.getCategory().getName())
                .attributes(attributes)
                .build();
    }
}


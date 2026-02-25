package com.example.sale_tech_web.feature.product.pm.manager;

import com.example.sale_tech_web.feature.product.entity.CategoryAttributeMapping;
import com.example.sale_tech_web.feature.product.pm.dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeMappingRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class PMService implements PMServiceInterface {
    private final ProductRepository productRepository;
    private final CategoryAttributeMappingRepository categoryAttributeMappingRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<AttributeResponse> getAttrByCategoryId(Long categoryId) {
        // Validate category tồn tại
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND,
                        "Category not found with id: " + categoryId));

        List<CategoryAttributeMapping> mappings =
                categoryAttributeMappingRepository.findAllByCategoryId(categoryId);

        return mappings.stream()
                .map(cam -> AttributeResponse.builder()
                        .attributeId(cam.getAttribute().getId())
                        .name(cam.getAttribute().getName())
                        .unit(cam.getAttribute().getUnit())
                        .dataType(cam.getAttribute().getDataType())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void addProductToCategory(Long categoryId) {

    }

    @Override
    public void updateProductDetails(Long productId) {

    }

    @Override
    public void deleteProduct(Long productId) {

    }
}



package com.example.sale_tech_web.feature.product.manager.pm;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.repository.CategoryAttributeSchemaRepository;
import com.example.sale_tech_web.feature.product.repository.CategoryRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CategoryPMService implements CategoryPMServiceInterface {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryAttributeSchemaRepository categoryAttributeSchemaRepository;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    })
    public CategoryDTO addCategory(String name) {
        Category category = new Category();
        category.setName(name);
        return convertCategoryDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    })
    public CategoryDTO updateCategory(Long categoryId, String name) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
        category.setName(name);
        category = categoryRepository.save(category);
        return convertCategoryDTO(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true),
            @CacheEvict(value = CacheNames.FILTER_OPTIONS, key = "#categoryId"),
            @CacheEvict(value = CacheNames.PRODUCT_BY_CATEGORY, key = "#categoryId")
    })
    public String deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        boolean exist = productRepository.existsByCategory(category);
        if (exist) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot delete category that still has products.");
        }

        boolean existSchema = categoryAttributeSchemaRepository.existsByCategory(category);
        if (existSchema) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot delete category that still has attribute schemas.");
        }

        categoryRepository.delete(category);
        return "Category with ID " + categoryId + " has been deleted.";
    }

    private CategoryDTO convertCategoryDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }
}


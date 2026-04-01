package com.example.sale_tech_web.controller.pm.product;

import com.example.sale_tech_web.feature.product.dto.customer.CategoryDTO;
import com.example.sale_tech_web.feature.product.manager.pm.CategoryPMServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/category")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class CategoryController {
    private final CategoryPMServiceInterface categoryPMService;

    @PostMapping()
    public ResponseEntity<CategoryDTO> addCategory(@RequestParam String name) {
        log.info("PM - Add category: name={}", name);
        return ResponseEntity.ok(categoryPMService.addCategory(name));
    }

    @PutMapping("{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long categoryId, @RequestParam String name) {
        log.info("PM - Update category: id={}, name={}", categoryId, name);
        return ResponseEntity.ok(categoryPMService.updateCategory(categoryId, name));
    }

    @DeleteMapping("{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        log.info("PM - Delete category: id={}", categoryId);
        return ResponseEntity.ok(categoryPMService.deleteCategory(categoryId));
    }
}

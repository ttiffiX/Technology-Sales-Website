package com.example.sale_tech_web.controller.pm.product;

import com.example.sale_tech_web.feature.product.dto.pm.AttributeResponse;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttribute;
import com.example.sale_tech_web.feature.product.dto.pm.CategoryAttributeRequest;
import com.example.sale_tech_web.feature.product.manager.pm.PMServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class AttributeController {
    private final PMServiceInterface pmServiceInterface;
    //todo
    @GetMapping("/category/{categoryId}/attributes")
    public ResponseEntity<List<AttributeResponse>> getAttrByCategoryId(@PathVariable Long categoryId) {
        log.info("PM - Get attributes for categoryId: {}", categoryId);
        return ResponseEntity.ok(pmServiceInterface.getAttrByCategoryId(categoryId));
    }

    @GetMapping("/category/{categoryId}/attributes-schema")
    public ResponseEntity<List<CategoryAttribute>> getAttributeByCategory(@PathVariable Long categoryId) {
        log.info("PM - Get category attributes: categoryId={}", categoryId);
        return ResponseEntity.ok(pmServiceInterface.getAttributeByCategory(categoryId));
    }

    // Attribute Schema endpoints
    @PostMapping("/category/{categoryId}/attributes-schema")
    public ResponseEntity<CategoryAttribute> addAttributeSchema(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryAttributeRequest request) {
        log.info("PM - Add attribute schema: categoryId={}, code={}", categoryId, request.getCode());
        return ResponseEntity.ok(pmServiceInterface.addAttributeSchema(categoryId, request));
    }

    @PutMapping("/category/{categoryId}/attributes-schema")
    public ResponseEntity<CategoryAttribute> updateAttributeSchema(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryAttributeRequest request) {
        log.info("PM - Update attribute schema: categoryId={}", categoryId);
        return ResponseEntity.ok(pmServiceInterface.updateAttributeSchema(categoryId, request));
    }

    @DeleteMapping("/attributes-schema/{attributeId}")
    public ResponseEntity<String> deleteAttributeSchema(@PathVariable Long attributeId) {
        log.info("PM - Delete attribute schema: attributeId={}", attributeId);
        return ResponseEntity.ok(pmServiceInterface.deleteAttributeSchema(attributeId));
    }
}

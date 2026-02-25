package com.example.sale_tech_web.controller.pm;

import com.example.sale_tech_web.feature.product.pm.dto.AttributeResponse;
import com.example.sale_tech_web.feature.product.pm.manager.PMServiceInterface;
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
public class PMController {
    private final PMServiceInterface pmServiceInterface;

    /**
     * GET /pm/category/{categoryId}/attributes
     * Lấy danh sách attributes của category để FE render đúng form addProduct.
     * Yêu cầu role PM.
     */
    @GetMapping("/category/{categoryId}/attributes")
    public ResponseEntity<List<AttributeResponse>> getAttrByCategoryId(@PathVariable Long categoryId) {
        log.info("PM - Get attributes for categoryId: {}", categoryId);
        List<AttributeResponse> attributes = pmServiceInterface.getAttrByCategoryId(categoryId);
        return ResponseEntity.ok(attributes);
    }
}

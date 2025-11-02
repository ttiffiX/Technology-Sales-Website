package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.manager.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/product"})
@CrossOrigin(
        origins = {"http://localhost:3000"}
)
@Slf4j
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        log.info("Get all products - Start");
        return this.productService.getAllProducts();
    }
}

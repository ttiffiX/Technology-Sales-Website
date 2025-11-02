package com.example.sale_tech_web.feature.product.manager;

import com.example.sale_tech_web.controller.exception.ServerException;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return this.productRepository.findAll(Sort.by(Sort.Order.desc("createAt")));
    }

    public Product getProductById(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new ServerException("Product not found"));
    }

//    public void updateProduct(Long productId, int quantity) {
//        Product product = productRepository.findById(productId).orElseThrow(() -> new ServerException("Product not found"));
//            product.setQuantity(product.getQuantity() - quantity);
//    }
}

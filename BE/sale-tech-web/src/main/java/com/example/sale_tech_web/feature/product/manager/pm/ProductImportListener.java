package com.example.sale_tech_web.feature.product.manager.pm;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.example.sale_tech_web.feature.cloudinary.dto.CloudinaryResponse;
import com.example.sale_tech_web.feature.cloudinary.manager.CloudinaryService;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductImportDTO;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class ProductImportListener extends AnalysisEventListener<ProductImportDTO> {
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    private final List<Product> cachedDataList = new ArrayList<>();
    private final Category category;
    private static final int BATCH_COUNT = 50;

    public ProductImportListener(ProductRepository productRepository,
                                 CloudinaryService cloudinaryService,
                                 Category category) {
        this.productRepository = productRepository;
        this.cloudinaryService = cloudinaryService;
        this.category = category;
    }

    @Override
    public void invoke(ProductImportDTO data, AnalysisContext context) {
        try {

            CloudinaryResponse res = cloudinaryService.uploadFromUrl(data.getImageUrl(), category.getName());
            cachedDataList.add(
                    Product.builder()
                            .title(data.getTitle())
                            .description(data.getDescription())
                            .price(data.getPrice())
                            .quantity(data.getQuantity())
                            .quantitySold(0)
                            .category(category)
                            .isActive(data.getIsActive())
                            .imageUrl(res.getImageUrl())
                            .publicId(res.getPublicId())
                            .build());
        } catch (Exception e) {
            log.error("Error occur in line {}: {}", context.readRowHolder().getRowIndex(), e.getMessage());
        }

        // Cứ 50 dòng thì lưu DB một lần để tối ưu RAM
        if (cachedDataList.size() >= 50) {
            saveData();
            cachedDataList.clear();
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData(); // Lưu nốt số còn lại
        log.info("Hoàn thành import!");
    }

    private void saveData() {
        // Logic convert DTO sang Entity và productRepository.saveAll()
    }
}
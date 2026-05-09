package com.example.sale_tech_web.feature.product.manager.pm;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.example.sale_tech_web.feature.cloudinary.dto.CloudinaryResponse;
import com.example.sale_tech_web.feature.cloudinary.manager.CloudinaryService;
import com.example.sale_tech_web.feature.product.dto.pm.product_dto.ProductImportDTO;
import com.example.sale_tech_web.feature.product.entity.Category;
import com.example.sale_tech_web.feature.product.entity.CategoryAttributeSchema;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import com.example.sale_tech_web.utils.ExcelMappingUtils;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.example.sale_tech_web.feature.product.utils.Validate.validateProductAttributes;

@Slf4j
public class ProductImportListener extends AnalysisEventListener<Map<Integer, Object>> {
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    private final List<CategoryAttributeSchema> schemas;
    private final List<Product> cachedDataList = new ArrayList<>();
    private Map<Integer, String> headMap = new HashMap<>();
    private final Category category;
    private static final int BATCH_COUNT = 50;

    public ProductImportListener(ProductRepository productRepository,
                                 List<CategoryAttributeSchema> schemas,
                                 CloudinaryService cloudinaryService,
                                 Category category) {
        this.productRepository = productRepository;
        this.schemas = schemas;
        this.cloudinaryService = cloudinaryService;
        this.category = category;
    }

    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        // Lưu lại header để biết cột index nào tên là gì
        this.headMap = headMap;
    }

    @Override
    public void invoke(Map<Integer, Object> rowData, AnalysisContext context) {
        try {
            // Lấy toàn bộ dữ liệu thô của dòng hiện tại (dạng Map<Index, Object>)
            ProductImportDTO data = ExcelMappingUtils.mapToDTO(rowData, this.headMap);

            Map<String, Object> finalAttributes = validateProductAttributes(schemas, data.getAttributes());

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
                            .attributes(finalAttributes)
                            .createdAt(LocalDateTime.now())
                            .build());

            // Cứ 50 dòng thì lưu DB một lần để tối ưu RAM
            if (cachedDataList.size() >= BATCH_COUNT) {
                saveData();
                cachedDataList.clear();
            }

        } catch (Exception e) {
            log.error("Error occur in line {}: {}", context.readRowHolder().getRowIndex(), e.getMessage());
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        if (!cachedDataList.isEmpty()) {
            saveData();
        }
        log.info("Import complete!");
    }

    private void saveData() {
        log.info("Save {} data into database...", cachedDataList.size());
        productRepository.saveAll(cachedDataList);
    }
}
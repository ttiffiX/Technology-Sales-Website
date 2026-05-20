package com.example.sale_tech_web.feature.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "category_attribute_schema")
public class CategoryAttributeSchema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    @Column(nullable = false)
    private String name;
    private String unit;
    private String dataType;
    private Boolean isFilterable;

    @Column(nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    private CategoryAttributeGroup categoryAttributeGroup;

    private Integer displayOrder;
}

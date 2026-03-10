package com.example.sale_tech_web.feature.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
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

    @Column(nullable = false, unique = true)
    private String code;
    private String groupName;
    private Integer groupOrder;
    private Integer displayOrder;
}

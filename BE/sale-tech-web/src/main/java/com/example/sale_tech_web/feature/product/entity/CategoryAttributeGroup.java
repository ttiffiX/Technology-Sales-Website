package com.example.sale_tech_web.feature.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "category_attribute_group")
public class CategoryAttributeGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    private String name;
    private Integer groupOrder;
}

package com.example.sale_tech_web.feature.product.entity;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "category_attribute_mapping")
public class CategoryAttributeMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "attribute_id")
    private ProductAttribute attribute;


    @Column(name = "is_filterable")
    private Boolean isFilterable;
}




package com.example.sale_tech_web.feature.product.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 5000)
    private String description;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "quantity_sold")
    private Integer quantitySold;

    @JsonIgnore
    @Column(name = "quantity")
    private Integer quantity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive;

    @JsonIgnore
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductAttributeValue> attributeValues;

    @Transient
    private Boolean stocked;

    public Boolean getStocked() {
        return this.quantity != null && this.quantity > 0;
    }
}


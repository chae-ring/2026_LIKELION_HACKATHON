package com.mcm.mcmoments.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String model;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 50)
    private String season;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "product_url", length = 500)
    private String productUrl;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Column(name = "is_recommendable", nullable = false)
    private boolean recommendable;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Product(
            String name,
            String model,
            String color,
            String category,
            String season,
            String imageUrl,
            String productUrl,
            Integer warrantyMonths,
            boolean recommendable
    ) {
        this.name = name;
        this.model = model;
        this.color = color;
        this.category = category;
        this.season = season;
        this.imageUrl = imageUrl;
        this.productUrl = productUrl;
        this.warrantyMonths = warrantyMonths;
        this.recommendable = recommendable;
    }

    public static Product create(
            String name,
            String model,
            String color,
            String category,
            String season,
            String imageUrl,
            String productUrl,
            Integer warrantyMonths,
            boolean recommendable
    ) {
        return new Product(
                name,
                model,
                color,
                category,
                season,
                imageUrl,
                productUrl,
                warrantyMonths,
                recommendable
        );
    }
}
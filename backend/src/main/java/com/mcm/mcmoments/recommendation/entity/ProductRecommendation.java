package com.mcm.mcmoments.recommendation.entity;

import com.mcm.mcmoments.product.entity.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "product_recommendations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_recommendations_pair",
                        columnNames = {
                                "base_product_id",
                                "recommended_product_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_product_recommendations_base_priority",
                        columnList = "base_product_id, priority"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "base_product_id", nullable = false)
    private Product baseProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recommended_product_id", nullable = false)
    private Product recommendedProduct;

    @Column(nullable = false)
    private int priority;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private ProductRecommendation(
            Product baseProduct,
            Product recommendedProduct,
            int priority
    ) {
        this.baseProduct = baseProduct;
        this.recommendedProduct = recommendedProduct;
        this.priority = priority;
    }

    public static ProductRecommendation create(
            Product baseProduct,
            Product recommendedProduct,
            int priority
    ) {
        return new ProductRecommendation(
                baseProduct,
                recommendedProduct,
                priority
        );
    }
}
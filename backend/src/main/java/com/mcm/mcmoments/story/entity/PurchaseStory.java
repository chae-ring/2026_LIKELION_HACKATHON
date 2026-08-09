package com.mcm.mcmoments.story.entity;

import com.mcm.mcmoments.product.entity.UserProduct;
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
        name = "purchase_stories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_purchase_stories_user_product_id",
                        columnNames = "user_product_id"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PurchaseStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_product_id", nullable = false)
    private UserProduct userProduct;

    @Column(nullable = false, length = 500)
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private PurchaseStory(
            UserProduct userProduct,
            String content
    ) {
        this.userProduct = userProduct;
        this.content = content;
    }

    public static PurchaseStory create(
            UserProduct userProduct,
            String content
    ) {
        return new PurchaseStory(userProduct, content);
    }
}
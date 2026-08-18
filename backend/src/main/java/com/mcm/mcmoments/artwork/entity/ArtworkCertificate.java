package com.mcm.mcmoments.artwork.entity;

import com.mcm.mcmoments.product.entity.Product;
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
@Table(name = "artwork_certificates")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ArtworkCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 아트워크 생성 시점에는 Product만 존재
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 최종 저장하기 전까지는 null 가능
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_product_id")
    private UserProduct userProduct;

    @Column(name = "artwork_url", columnDefinition = "TEXT")
    private String artworkUrl;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ArtworkStatus status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private ArtworkCertificate(
            Product product,
            String prompt
    ) {
        this.product = product;
        this.prompt = prompt;
        this.status = ArtworkStatus.PENDING;
    }

    public static ArtworkCertificate create(
            Product product,
            String prompt
    ) {
        return new ArtworkCertificate(
                product,
                prompt
        );
    }

    // UserProduct 최종 등록 후 Artwork와 연결
    public void assignUserProduct(UserProduct userProduct) {
        this.userProduct = userProduct;
    }

    public void complete(String artworkUrl) {
        this.artworkUrl = artworkUrl;
        this.status = ArtworkStatus.COMPLETED;
    }

    public void fail() {
        this.artworkUrl = null;
        this.status = ArtworkStatus.FAILED;
    }

    public void retry(String prompt) {
        this.prompt = prompt;
        this.artworkUrl = null;
        this.status = ArtworkStatus.PENDING;
    }
}
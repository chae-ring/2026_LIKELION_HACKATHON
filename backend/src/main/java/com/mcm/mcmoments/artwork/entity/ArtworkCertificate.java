package com.mcm.mcmoments.artwork.entity;

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
        name = "artwork_certificates",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_artwork_certificates_user_product_id",
                        columnNames = "user_product_id"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ArtworkCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_product_id", nullable = false)
    private UserProduct userProduct;

    @Column(name = "artwork_url", length = 500)
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
            UserProduct userProduct,
            String prompt
    ) {
        this.userProduct = userProduct;
        this.prompt = prompt;
        this.status = ArtworkStatus.PENDING;
    }

    public static ArtworkCertificate create(
            UserProduct userProduct,
            String prompt
    ) {
        return new ArtworkCertificate(userProduct, prompt);
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
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
@Table(
        name = "product_serials",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_serials_serial_number",
                        columnNames = "serial_number"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductSerial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private ProductSerial(
            Product product,
            String serialNumber,
            boolean active
    ) {
        this.product = product;
        this.serialNumber = serialNumber;
        this.active = active;
    }

    public static ProductSerial create(
            Product product,
            String serialNumber
    ) {
        return new ProductSerial(product, serialNumber, true);
    }

    public void deactivate() {
        this.active = false;
    }
}
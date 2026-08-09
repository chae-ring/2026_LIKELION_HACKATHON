package com.mcm.mcmoments.product.entity;

import com.mcm.mcmoments.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "user_products",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_products_serial_id",
                        columnNames = "serial_id"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "serial_id", nullable = false)
    private ProductSerial serial;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "warranty_expires_at")
    private LocalDate warrantyExpiresAt;

    @CreatedDate
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    private UserProduct(
            User user,
            ProductSerial serial,
            LocalDate purchaseDate,
            LocalDate warrantyExpiresAt
    ) {
        this.user = user;
        this.serial = serial;
        this.purchaseDate = purchaseDate;
        this.warrantyExpiresAt = warrantyExpiresAt;
    }

    public static UserProduct create(
            User user,
            ProductSerial serial,
            LocalDate purchaseDate
    ) {
        Integer warrantyMonths = serial.getProduct().getWarrantyMonths();

        LocalDate warrantyExpiresAt =
                purchaseDate != null && warrantyMonths != null
                        ? purchaseDate.plusMonths(warrantyMonths)
                        : null;

        return new UserProduct(
                user,
                serial,
                purchaseDate,
                warrantyExpiresAt
        );
    }

    public Product getProduct() {
        return serial.getProduct();
    }
}
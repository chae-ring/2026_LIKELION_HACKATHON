package com.mcm.mcmoments.product.dto;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.UserProduct;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserProductCreateResponse {

    private Long userProductId;
    private ProductInfo product;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiresAt;
    private LocalDateTime registeredAt;

    public static UserProductCreateResponse from(
            UserProduct userProduct
    ) {

        Product product = userProduct.getProduct();

        return new UserProductCreateResponse(
                userProduct.getId(),
                new ProductInfo(
                        product.getId(),
                        product.getName(),
                        product.getColor(),
                        product.getCategory()
                ),
                userProduct.getPurchaseDate(),
                userProduct.getWarrantyExpiresAt(),
                userProduct.getRegisteredAt()
        );
    }

    @Getter
    @AllArgsConstructor
    public static class ProductInfo {

        private Long id;
        private String name;
        private String color;
        private String category;
    }
}
package com.mcm.mcmoments.product.dto;

import com.mcm.mcmoments.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SerialVerifyResponse {

    private boolean valid;
    private ProductInfo product;

    public static SerialVerifyResponse valid(Product product) {
        return new SerialVerifyResponse(
                true,
                new ProductInfo(
                        product.getId(),
                        product.getName(),
                        product.getModel(),
                        product.getColor(),
                        product.getCategory(),
                        product.getImageUrl()
                )
        );
    }

    public static SerialVerifyResponse invalid() {
        return new SerialVerifyResponse(
                false,
                null
        );
    }

    @Getter
    @AllArgsConstructor
    public static class ProductInfo {

        private Long id;
        private String name;
        private String model;
        private String color;
        private String category;
        private String imageUrl;
    }
}
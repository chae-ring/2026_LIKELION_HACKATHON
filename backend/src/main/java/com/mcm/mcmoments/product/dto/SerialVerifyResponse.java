package com.mcm.mcmoments.product.dto;

import com.mcm.mcmoments.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SerialVerifyResponse {

    private boolean valid;
    private ProductInfo product;
    private String message;

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
                ),
                "등록 가능한 제품입니다."
        );
    }

    public static SerialVerifyResponse invalid(String message) {
        return new SerialVerifyResponse(
                false,
                null,
                message
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
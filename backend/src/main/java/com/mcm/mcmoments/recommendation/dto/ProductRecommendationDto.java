package com.mcm.mcmoments.recommendation.dto;

import com.mcm.mcmoments.product.entity.Product;

public record ProductRecommendationDto(
        String name,
        String category,
        String season,
        String imageUrl,
        String reason,
        String productUrl
) {
    public static ProductRecommendationDto of(Product product, String reason) {
        return new ProductRecommendationDto(
                product.getName(),
                product.getCategory(),
                product.getSeason(),
                product.getImageUrl(),
                reason,
                product.getProductUrl()
        );
    }
}

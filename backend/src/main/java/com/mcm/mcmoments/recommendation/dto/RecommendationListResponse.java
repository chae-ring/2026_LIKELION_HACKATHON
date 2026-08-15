package com.mcm.mcmoments.recommendation.dto;

import java.util.List;

public record RecommendationListResponse(
        List<ProductRecommendationDto> recommendations
) {
    public static RecommendationListResponse from(List<ProductRecommendationDto> recommendations) {
        return new RecommendationListResponse(recommendations);
    }
}

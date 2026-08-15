package com.mcm.mcmoments.product.dto;

/**
 * AI가 제안한, 아직 검증되지 않은 신상품 후보.
 *
 * ProductDiscoveryService가 imageUrl/productUrl의 실제 접근 가능 여부를 검증한 뒤에만
 * Product 엔티티로 변환되어 카탈로그(products 테이블)에 저장된다.
 * 검증되기 전까지는 절대 사용자에게 노출되면 안 된다.
 */
public record NewProductCandidate(
        String name,
        String category,
        String color,
        String season,
        String imageUrl,
        String productUrl
) {
}

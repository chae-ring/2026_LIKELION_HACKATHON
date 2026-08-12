package com.mcm.mcmoments.recommendation.service;

import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.recommendation.dto.ProductRecommendationDto;
import com.mcm.mcmoments.recommendation.dto.RecommendationListResponse;
import com.mcm.mcmoments.recommendation.entity.ProductRecommendation;
import com.mcm.mcmoments.recommendation.repository.ProductRecommendationRepository;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.repository.PurchaseStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserProductRepository userProductRepository;
    private final ProductRecommendationRepository recommendationRepository;
    private final PurchaseStoryRepository purchaseStoryRepository;
    private final AiRecommendationReasonGenerator aiReasonGenerator;

    @Transactional(readOnly = true)
    public RecommendationListResponse getRecommendations(Long userProductId) {
        UserProduct userProduct = userProductRepository.findById(userProductId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "등록된 제품을 찾을 수 없습니다."));

        PurchaseStory story = purchaseStoryRepository.findByUserProductId(userProductId).orElse(null);

        List<ProductRecommendation> recommendations = recommendationRepository.findByBaseProductIdWithProduct(
                userProduct.getProduct().getId()
        );

        List<ProductRecommendationDto> dtos = recommendations.stream()
                .map(rec -> {
                    String reason = aiReasonGenerator.generateReason(
                            userProduct.getProduct(),
                            rec.getRecommendedProduct(),
                            story
                    );
                    return ProductRecommendationDto.of(rec.getRecommendedProduct(), reason);
                })
                .toList();

        return RecommendationListResponse.from(dtos);
    }
}

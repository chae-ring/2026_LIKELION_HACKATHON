package com.mcm.mcmoments.recommendation.service;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.ProductRepository;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.recommendation.dto.ProductRecommendationDto;
import com.mcm.mcmoments.recommendation.dto.RecommendationListResponse;
import com.mcm.mcmoments.recommendation.entity.ProductRecommendation;
import com.mcm.mcmoments.recommendation.repository.ProductRecommendationRepository;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 추천 로직 구조:
 * 1) DB 후보(is_recommendable=true, 미보유) 전체를 조회한다.
 * 2) 후보 전체 + 보유 컬렉션을 AI(gpt-4o-mini) 한 번 호출로 넘겨 top3 선정 + 이유 생성을 맡긴다.
 * 3) AI 호출이 실패하면 product_recommendations 큐레이션 → 카테고리/색상/모델 스코어링 순으로 폴백한다.
 *
 * 신상품 실시간 웹 검색은 이 클래스가 직접 호출하지 않는다. (한때 매 요청마다 실시간으로 호출하도록
 * 구현했었지만, MCM 공식몰이 봇 차단(WAF)을 걸어놔서 실제로 존재하는 상품도 403/연결 리셋으로 막히고
 * 이미지(og:image) 스크래핑은 아예 안 되는 걸 실측으로 확인했다. 게다가 매 요청마다 수십 초씩 지연이
 * 붙어 사용자 경험도 나빴다.) 대신 ProductDiscoveryService + ProductDiscoveryRunner
 * (spring.profiles.active=discovery)가 오프라인 배치로 카탈로그를 보강하고, 이 서비스는 항상 DB에
 * 이미 검증되어 저장된 후보만 사용해 빠르고 안정적으로 응답한다.
 *
 * 주의: 이 클래스는 의도적으로 클래스/메서드 레벨 @Transactional을 쓰지 않는다. OpenAI 호출(추천 이유
 * 생성)도 수 초가 걸리는 네트워크 호출이라, 이를 트랜잭션(=DB 커넥션 점유) 안에 가두지 않기 위해서다.
 * 각 리포지토리 호출은 Spring Data JPA가 자체적으로 트랜잭션을 걸어주므로 개별 조회/저장 자체의 원자성에는
 * 문제가 없다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final int RECOMMENDATION_LIMIT = 3;

    private final UserRepository userRepository;
    private final UserProductRepository userProductRepository;
    private final ProductRepository productRepository;
    private final ProductRecommendationRepository productRecommendationRepository;
    private final AiRecommendationReasonGenerator aiReasonGenerator;

    public RecommendationListResponse getRecommendationsByUserId(Long userId) {
        RecommendationContext context = loadContext(userId);

        List<Product> allCandidates = context.candidates();

        if (allCandidates.isEmpty()) {
            return RecommendationListResponse.from(List.of());
        }

        Map<Long, String> aiReasons = aiReasonGenerator.generateCollectionBasedRecommendations(context.userProducts(), allCandidates);

        List<Product> selectedProducts;
        Map<Long, String> reasons;

        if (!aiReasons.isEmpty()) {
            Map<Long, Product> candidateById = new LinkedHashMap<>();
            allCandidates.forEach(p -> candidateById.put(p.getId(), p));

            selectedProducts = aiReasons.keySet().stream()
                    .map(candidateById::get)
                    .filter(Objects::nonNull)
                    .limit(RECOMMENDATION_LIMIT)
                    .toList();
            reasons = aiReasons;
        } else {
            log.warn("AI 추천이 비어 있어 폴백(큐레이션/스코어링) 추천으로 대체합니다. userId={}", userId);
            selectedProducts = fallbackRecommendations(context.userProducts(), allCandidates, context.ownedProductIds());
            reasons = Map.of();
        }

        List<ProductRecommendationDto> finalRecommendations = selectedProducts.stream()
                .map(product -> ProductRecommendationDto.of(
                        product,
                        reasons.getOrDefault(product.getId(), fallbackReason(product))
                ))
                .toList();

        return RecommendationListResponse.from(finalRecommendations);
    }

    private RecommendationContext loadContext(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        List<UserProduct> userProducts = userProductRepository.findByUserIdWithProduct(userId);

        Set<Long> ownedProductIds = userProducts.stream()
                .map(up -> up.getProduct().getId())
                .collect(Collectors.toSet());

        List<Product> candidates = productRepository.findByRecommendableTrue().stream()
                .filter(p -> !ownedProductIds.contains(p.getId()))
                .collect(Collectors.toList());

        return new RecommendationContext(userProducts, ownedProductIds, candidates);
    }

    /**
     * AI 추천이 실패했을 때의 폴백 체인.
     * 1) product_recommendations 테이블에 큐레이션된(관리자가 미리 검증해둔) 페어를 우선 사용한다.
     * 2) 그래도 3개가 안 채워지면 카테고리/색상/모델 유사도 스코어링으로 나머지를 채운다.
     */
    private List<Product> fallbackRecommendations(
            List<UserProduct> userProducts,
            List<Product> candidates,
            Set<Long> ownedProductIds
    ) {
        Map<Long, Product> curated = new LinkedHashMap<>();
        for (UserProduct owned : userProducts) {
            Long baseProductId = owned.getProduct().getId();
            for (ProductRecommendation pr : productRecommendationRepository.findByBaseProductIdWithProduct(baseProductId)) {
                Product recommended = pr.getRecommendedProduct();
                if (!ownedProductIds.contains(recommended.getId())) {
                    curated.putIfAbsent(recommended.getId(), recommended);
                }
            }
        }

        List<Product> result = new ArrayList<>(curated.values());

        if (result.size() < RECOMMENDATION_LIMIT) {
            List<Product> scored = candidates.stream()
                    .filter(p -> !curated.containsKey(p.getId()))
                    .sorted(Comparator.<Product>comparingInt(p -> recommendationScore(p, userProducts)).reversed())
                    .toList();
            for (Product p : scored) {
                if (result.size() >= RECOMMENDATION_LIMIT) {
                    break;
                }
                result.add(p);
            }
        }

        return result.size() > RECOMMENDATION_LIMIT ? result.subList(0, RECOMMENDATION_LIMIT) : result;
    }

    private int recommendationScore(Product candidate, List<UserProduct> ownedProducts) {
        long sameCategoryCount = ownedProducts.stream()
                .filter(owned -> candidate.getCategory().equalsIgnoreCase(owned.getProduct().getCategory()))
                .count();
        boolean hasSameColor = ownedProducts.stream()
                .anyMatch(owned -> candidate.getColor().equalsIgnoreCase(owned.getProduct().getColor()));
        boolean hasSameModel = candidate.getModel() != null && ownedProducts.stream()
                .anyMatch(owned -> candidate.getModel().equalsIgnoreCase(owned.getProduct().getModel()));

        int score = 100 - (int) sameCategoryCount * 20;
        if (hasSameColor) score += 10;
        if (hasSameModel) score += 8;
        return score;
    }

    private String fallbackReason(Product product) {
        return product.getCategory() + " 카테고리로 컬렉션의 스타일 선택지를 자연스럽게 넓혀줄 아이템입니다.";
    }

    private record RecommendationContext(
            List<UserProduct> userProducts,
            Set<Long> ownedProductIds,
            List<Product> candidates
    ) {
    }
}

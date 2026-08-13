package com.mcm.mcmoments.recommendation.service;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.ProductRepository;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.recommendation.dto.ProductRecommendationDto;
import com.mcm.mcmoments.recommendation.dto.RecommendationListResponse;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;
    private final UserProductRepository userProductRepository;
    private final ProductRepository productRepository;
    private final AiRecommendationReasonGenerator aiReasonGenerator;

    @Transactional
    public RecommendationListResponse getRecommendationsByUserId(Long userId) {
        // 1. 유저 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 2. 사용자의 모든 소장품 조회
        List<UserProduct> userProducts = userProductRepository.findByUserIdWithProduct(userId);
        
        Set<Long> ownedProductIds = userProducts.stream()
                .map(up -> up.getProduct().getId())
                .collect(Collectors.toSet());

        // 3. DB 마스터 테이블에서 추천 가능한 검증된 상품 후보군 조회
        List<Product> dbCandidates = productRepository.findByRecommendableTrue();
        List<Product> filteredCandidates = dbCandidates.stream()
                .filter(p -> !ownedProductIds.contains(p.getId()))
                .collect(Collectors.toList());

        // 4. DB 후보군이 3개 미만이거나 새로운 확장이 필요한 경우 Web Search 수행
        if (filteredCandidates.size() < 3) {
            log.info("DB 후보군이 부족하여 Web Search를 시도합니다.");
            List<ProductRecommendationDto> searchedProducts = aiReasonGenerator.findNewProductsViaWebSearch(userProducts);
            
            for (ProductRecommendationDto dto : searchedProducts) {
                // Static Validation (정적 검증)
                if (isValidMcmProduct(dto)) {
                    // 중복 확인
                    boolean exists = productRepository.findAll().stream()
                            .anyMatch(p -> dto.productUrl().equals(p.getProductUrl()));
                    if (!exists) {
                        Product newProd = Product.create(
                                dto.name(),
                                null,
                                "Default Color",
                                dto.category(),
                                dto.season(),
                                dto.imageUrl(),
                                dto.productUrl(),
                                24,
                                true
                        );
                        productRepository.save(newProd);
                        filteredCandidates.add(newProd);
                        log.info("Web Search 검증 완료 및 새 상품 저장: {}", dto.name());
                    }
                } else {
                    log.warn("Web Search 결과 검증 실패 (저장 안함): {}", dto.name());
                }
            }
        }

        if (filteredCandidates.isEmpty()) {
            return RecommendationListResponse.from(List.of()); // 후보 없음
        }

        // 5. AI(gpt-4o-mini)를 통한 전체 컬렉션 기반 추천 분석
        Map<Long, String> aiResult = aiReasonGenerator.generateCollectionBasedRecommendations(
                userProducts, filteredCandidates
        );

        // 6. 응답된 productId를 DB에서 조회하여(Source of Truth) 최종 Response 생성
        List<ProductRecommendationDto> finalRecommendations = new ArrayList<>();
        Map<Long, Product> candidateMap = filteredCandidates.stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (p1, p2) -> p1));

        int count = 0;
        for (Map.Entry<Long, String> entry : aiResult.entrySet()) {
            if (count >= 3) break;
            Long productId = entry.getKey();
            String reason = entry.getValue();

            Product product = candidateMap.get(productId);
            if (product != null) { // AI가 존재하지 않는 ID를 반환하면 무시 (검증)
                finalRecommendations.add(ProductRecommendationDto.of(product, reason));
                count++;
            }
        }

        return RecommendationListResponse.from(finalRecommendations);
    }

    private boolean isValidMcmProduct(ProductRecommendationDto dto) {
        if (dto.productUrl() == null || dto.imageUrl() == null) return false;
        if (dto.name() == null || dto.name().isBlank()) return false;
        
        String pUrl = dto.productUrl().toLowerCase();
        String iUrl = dto.imageUrl().toLowerCase();

        // 1. 도메인 검증
        if (!pUrl.contains("mcmworldwide.com")) {
            return false;
        }

        // 2. 이미지 검증 (공식 CDN이거나 정상적인 이미지 확장자인지)
        if (!iUrl.startsWith("http")) {
            return false;
        }
        boolean isImageExt = iUrl.endsWith(".jpg") || iUrl.endsWith(".jpeg") || iUrl.endsWith(".png") || iUrl.endsWith(".webp");
        boolean isCdn = iUrl.contains("cdn.mcmworldwide.com") || iUrl.contains("mcmworldwide");

        return isImageExt || isCdn;
    }
}

package com.mcm.mcmoments.product.service;

import com.mcm.mcmoments.product.dto.NewProductCandidate;
import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.repository.ProductRepository;
import com.mcm.mcmoments.recommendation.service.AiRecommendationReasonGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 신상품(카탈로그에 없는 MCM 상품) 오프라인 발굴 파이프라인.
 *
 * 절대 사용자 요청 경로에서 직접 호출하지 않는다.
 * ProductDiscoveryRunner(spring.profiles.active=discovery)를 통해서만 실행된다.
 * (참고: RecommendationService도 동일한 discoverNewCatalogProducts를 실시간 경로에서 사용하므로,
 *  이 배치는 실시간 경로에서 놓친 시간대에 카탈로그를 보강하는 보조 수단이 된다.)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductDiscoveryService {

    private static final int DEFAULT_WARRANTY_MONTHS = 24;

    private final ProductRepository productRepository;
    private final AiRecommendationReasonGenerator aiRecommendationReasonGenerator;
    private final UrlReachabilityChecker urlReachabilityChecker;

    public void runDiscovery() {
        List<Product> existingProducts = productRepository.findAll();
        List<String> existingNames = existingProducts.stream().map(Product::getName).toList();

        List<NewProductCandidate> candidates = aiRecommendationReasonGenerator.discoverNewCatalogProducts(existingNames);

        if (candidates.isEmpty()) {
            log.info("[discovery] AI가 신상품 후보를 반환하지 않았습니다. 종료합니다.");
            return;
        }

        int inserted = 0;
        int skippedDuplicate = 0;
        int skippedInvalidUrl = 0;

        for (NewProductCandidate candidate : candidates) {
            if (existingNames.contains(candidate.name())) {
                log.info("[discovery] 이미 카탈로그에 있는 상품이라 건너뜁니다: {}", candidate.name());
                skippedDuplicate++;
                continue;
            }

            if (!urlReachabilityChecker.isReachable(candidate.productUrl())) {
                log.warn("[discovery] 상품 URL 검증 실패로 제외합니다: {} (productUrl={})",
                        candidate.name(), candidate.productUrl());
                skippedInvalidUrl++;
                continue;
            }

            String imageUrl = urlReachabilityChecker.resolveImageUrl(candidate.imageUrl(), candidate.productUrl())
                    .orElse(null);
            if (imageUrl == null) {
                log.warn("[discovery] 이미지 URL을 찾지 못해 제외합니다: {} (productUrl={})",
                        candidate.name(), candidate.productUrl());
                skippedInvalidUrl++;
                continue;
            }

            Product product = Product.create(
                    candidate.name(),
                    null,
                    candidate.color() == null || candidate.color().isBlank() ? "Various" : candidate.color(),
                    candidate.category(),
                    candidate.season(),
                    imageUrl,
                    candidate.productUrl(),
                    DEFAULT_WARRANTY_MONTHS,
                    true
            );
            productRepository.save(product);
            inserted++;
            log.info("[discovery] 신상품 등록 완료: {}", candidate.name());
        }

        log.info("[discovery] 완료 - AI 제안 {}건 중 등록 {}건 / 중복 제외 {}건 / URL 검증 실패 제외 {}건",
                candidates.size(), inserted, skippedDuplicate, skippedInvalidUrl);
    }
}

package com.mcm.mcmoments.collection.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.care.entity.CareGuideItem;
import com.mcm.mcmoments.collection.dto.AftercareResponse;
import com.mcm.mcmoments.collection.dto.AftercareResponse.Warranty;
import com.mcm.mcmoments.collection.dto.AftercareResponse.WarrantyStatus;
import com.mcm.mcmoments.collection.dto.CollectionDetailResponse;
import com.mcm.mcmoments.collection.dto.CollectionListResponse;
import com.mcm.mcmoments.collection.repository.CollectionRepository;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 로그인 사용자의 작품을 조회하고 API 응답 DTO로 변환합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    private final CollectionRepository collectionRepository;

    public CollectionListResponse getCollections(Long userId) {

        // Repository에서 사용자 ID에 속한 작품과 연관 상품 정보를 함께 조회합니다.
        List<ArtworkCertificate> artworks =
                collectionRepository.findAllByUserId(userId);

        return CollectionListResponse.from(artworks);
    }

    public CollectionDetailResponse getCollectionDetail(
            Long artworkId,
            Long userId
    ) {
        // 작품 ID와 사용자 ID를 함께 검사해 다른 사용자의 작품도 조회되지 않게 합니다.
        ArtworkCertificate artwork = collectionRepository
                .findDetailByArtworkIdAndUserId(artworkId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "컬렉션 작품을 찾을 수 없습니다."
                ));

        PurchaseStory story = collectionRepository
                .findStoryByUserProductId(artwork.getUserProduct().getId())
                .orElse(null);

        // 사연이 없으면 감정도 조회하지 않고 응답의 story를 null로 반환합니다.
        List<StoryEmotion> storyEmotions = story == null
                ? List.of()
                : collectionRepository.findEmotionsByStoryIdOrderByIdAsc(
                        story.getId()
                );

        return CollectionDetailResponse.from(
                artwork,
                story,
                storyEmotions
        );
    }

    public AftercareResponse getAftercare(
            Long userProductId,
            Long userId
    ) {
        // 요청 상품이 로그인 사용자의 소유인지 조회 단계에서 함께 확인합니다.
        UserProduct userProduct = collectionRepository
                .findUserProductByIdAndUserId(userProductId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "등록된 사용자 상품을 찾을 수 없습니다."
                ));

        LocalDate today = LocalDate.now(SEOUL_ZONE);
        Warranty warranty = createWarranty(userProduct, today);

        List<CareGuideItem> careGuideItems = collectionRepository
                .findCareGuideByCategory(userProduct.getProduct().getCategory())
                .map(careGuide -> collectionRepository
                        .findCareGuideItemsByGuideId(careGuide.getId()))
                .orElseGet(List::of);

        return AftercareResponse.from(warranty, careGuideItems);
    }

    private Warranty createWarranty(
            UserProduct userProduct,
            LocalDate today
    ) {
        LocalDate purchaseDate = userProduct.getPurchaseDate();
        LocalDate expiresAt = userProduct.getWarrantyExpiresAt();

        // 구매일이나 만료일 중 하나라도 없으면 보증 상태를 계산할 수 없습니다.
        if (purchaseDate == null || expiresAt == null) {
            return new Warranty(
                    WarrantyStatus.UNKNOWN,
                    purchaseDate,
                    null,
                    null
            );
        }

        if (expiresAt.isBefore(today)) {
            return new Warranty(
                    WarrantyStatus.EXPIRED,
                    purchaseDate,
                    expiresAt,
                    0
            );
        }

        // 날짜의 일(day)은 제외하고 YearMonth 사이의 개월 차이를 계산합니다.
        int monthsLeft = Math.toIntExact(ChronoUnit.MONTHS.between(
                YearMonth.from(today),
                YearMonth.from(expiresAt)
        ));

        WarrantyStatus status = monthsLeft <= 3
                ? WarrantyStatus.EXPIRING
                : WarrantyStatus.ACTIVE;

        return new Warranty(
                status,
                purchaseDate,
                expiresAt,
                monthsLeft
        );
    }
}

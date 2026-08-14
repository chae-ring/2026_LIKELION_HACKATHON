package com.mcm.mcmoments.collection.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.collection.dto.CollectionDetailResponse;
import com.mcm.mcmoments.collection.dto.CollectionListResponse;
import com.mcm.mcmoments.collection.repository.CollectionRepository;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 로그인 사용자의 작품을 조회하고 API 응답 DTO로 변환합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

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
}

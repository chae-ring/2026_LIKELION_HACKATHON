package com.mcm.mcmoments.collection.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.collection.dto.CollectionListResponse;
import com.mcm.mcmoments.collection.repository.CollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}

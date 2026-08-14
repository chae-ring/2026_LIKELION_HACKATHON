package com.mcm.mcmoments.collection.controller;

import com.mcm.mcmoments.collection.dto.AftercareResponse;
import com.mcm.mcmoments.collection.dto.CollectionDetailResponse;
import com.mcm.mcmoments.collection.dto.CollectionListResponse;
import com.mcm.mcmoments.collection.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 로그인 사용자의 컬렉션 목록 요청을 받는 API 진입점입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class CollectionController {

    private final CollectionService collectionService;

    /**
     * JWT 인증 필터가 Authentication principal에 넣은 사용자 ID로 컬렉션을 조회합니다.
     */
    @GetMapping("/collections")
    public ResponseEntity<CollectionListResponse> getCollections(
            Authentication authentication
    ) {

        Long userId = (Long) authentication.getPrincipal();

        CollectionListResponse response =
                collectionService.getCollections(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * URL의 artworkId와 JWT의 사용자 ID를 함께 사용해 컬렉션 상세 정보를 조회합니다.
     */
    @GetMapping("/collections/{artworkId}")
    public ResponseEntity<CollectionDetailResponse> getCollectionDetail(
            @PathVariable("artworkId") Long artworkId,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();

        CollectionDetailResponse response =
                collectionService.getCollectionDetail(artworkId, userId);

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인 사용자가 등록한 상품의 보증 정보와 카테고리별 관리 팁을 조회합니다.
     */
    @GetMapping("/user-products/{userProductId}/aftercare")
    public ResponseEntity<AftercareResponse> getAftercare(
            @PathVariable("userProductId") Long userProductId,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();

        AftercareResponse response =
                collectionService.getAftercare(userProductId, userId);

        return ResponseEntity.ok(response);
    }
}

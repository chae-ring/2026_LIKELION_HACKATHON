package com.mcm.mcmoments.story.service;

import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.story.dto.StoryCreateRequest;
import com.mcm.mcmoments.story.dto.StoryCreateResponse;
import com.mcm.mcmoments.story.entity.Emotion;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import com.mcm.mcmoments.story.repository.PurchaseStoryRepository;
import com.mcm.mcmoments.story.repository.StoryEmotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 스토리 생성에 필요한 검증과 저장 순서를 담당하는 비즈니스 계층입니다.
 * {@code @Service}를 사용하면 Spring이 이 클래스를 관리하며 Controller에 주입할 수 있습니다.
 * 클래스의 기본 트랜잭션은 조회 전용으로 두고, 데이터를 저장하는 메서드만 쓰기 트랜잭션을 사용합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoryService {

    private static final int MAX_CONTENT_LENGTH = 500;

    private final PurchaseStoryRepository purchaseStoryRepository;
    private final StoryEmotionRepository storyEmotionRepository;
    private final UserProductRepository userProductRepository;

    /**
     * 스토리와 감정을 하나의 작업 단위로 저장합니다.
     * {@code @Transactional} 덕분에 중간 저장이 실패하면 앞에서 저장한 내용도 함께 취소됩니다.
     */
    @Transactional
    public StoryCreateResponse createStory(
            Long userProductId,
            StoryCreateRequest request
    ) {

        // 1. DB에 접근하기 전에 요청 내용이 Entity 제약에 맞는지 확인합니다.
        validateRequest(request);

        // 2. URL로 받은 ID에 해당하는 사용자 상품이 실제로 존재하는지 확인합니다.
        UserProduct userProduct = userProductRepository
                .findById(userProductId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "사용자 상품을 찾을 수 없습니다."
                        )
                );

        // 3. 한 사용자 상품에 스토리가 하나만 저장되도록 미리 중복을 확인합니다.
        if (purchaseStoryRepository
                .existsByUserProduct_Id(userProductId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 등록된 구매 스토리가 있습니다."
            );
        }

        // 4. 같은 감정이 여러 번 들어오면 입력 순서를 유지하면서 하나만 남깁니다.
        List<Emotion> emotions = request.getEmotions()
                .stream()
                .distinct()
                .toList();

        // 5. 사용자 상품과 내용을 연결한 PurchaseStory를 먼저 저장합니다.
        PurchaseStory story = PurchaseStory.create(
                userProduct,
                request.getContent()
        );

        purchaseStoryRepository.save(story);

        // 6. 선택한 감정마다 StoryEmotion을 만들고 한 번에 저장합니다.
        List<StoryEmotion> storyEmotions = emotions.stream()
                .map(emotion ->
                        StoryEmotion.create(story, emotion)
                )
                .toList();

        storyEmotionRepository.saveAll(storyEmotions);

        // 7. 저장된 Entity를 API 명세에 맞는 응답 DTO로 바꿉니다.
        return StoryCreateResponse.from(
                story,
                emotions
        );
    }

    /**
     * 잘못된 입력이 DB 오류로 이어지기 전에 400 Bad Request로 처리합니다.
     */
    private void validateRequest(StoryCreateRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "요청 본문은 필수입니다."
            );
        }

        if (request.getContent() == null
                || request.getContent().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "스토리 내용은 필수입니다."
            );
        }

        if (request.getContent().length() > MAX_CONTENT_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "스토리 내용은 500자 이하여야 합니다."
            );
        }

        if (request.getEmotions() == null
                || request.getEmotions().contains(null)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "감정 목록은 필수입니다."
            );
        }
    }
}

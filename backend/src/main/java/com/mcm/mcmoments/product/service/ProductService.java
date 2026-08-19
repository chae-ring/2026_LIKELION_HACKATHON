package com.mcm.mcmoments.product.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.entity.ArtworkStatus;
import com.mcm.mcmoments.artwork.repository.ArtworkCertificateRepository;
import com.mcm.mcmoments.product.dto.SerialVerifyResponse;
import com.mcm.mcmoments.product.dto.UserProductCreateRequest;
import com.mcm.mcmoments.product.dto.UserProductCreateResponse;
import com.mcm.mcmoments.product.entity.ProductSerial;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.ProductSerialRepository;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.story.entity.Emotion;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import com.mcm.mcmoments.story.repository.PurchaseStoryRepository;
import com.mcm.mcmoments.story.repository.StoryEmotionRepository;
import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductSerialRepository productSerialRepository;
    private final UserProductRepository userProductRepository;
    private final UserRepository userRepository;

    private final ArtworkCertificateRepository artworkCertificateRepository;

    private final PurchaseStoryRepository purchaseStoryRepository;
    private final StoryEmotionRepository storyEmotionRepository;

    /**
     * 시리얼 번호 검증
     */
    public SerialVerifyResponse verifySerial(String serialNumber) {

        ProductSerial serial = productSerialRepository
                .findBySerialNumber(serialNumber)
                .orElse(null);

        // 1. 존재하지 않는 시리얼
        if (serial == null) {
            return SerialVerifyResponse.invalid(
                    "존재하지 않는 시리얼 번호입니다."
            );
        }

        /*
         * 중요:
         * 등록이 완료되면 아래 registerProduct()에서
         * serial.deactivate()를 호출하기 때문에
         *
         * 이미 등록된 시리얼은
         * 1) user_products에도 존재하고
         * 2) isActive도 false인 상태가 됨
         *
         * 따라서 existsBySerial_Id 검사를
         * isActive 검사보다 먼저 해야
         * "이미 등록된 시리얼"로 정확히 구분 가능
         */

        // 2. 이미 사용자에게 등록된 시리얼
        if (userProductRepository.existsBySerial_Id(serial.getId())) {
            return SerialVerifyResponse.invalid(
                    "이미 등록된 시리얼 번호입니다."
            );
        }

        // 3. DB에는 있지만 현재 사용할 수 없는 시리얼
        if (!serial.isActive()) {
            return SerialVerifyResponse.invalid(
                    "등록할 수 없는 시리얼 번호입니다."
            );
        }

        // 4. 등록 가능
        return SerialVerifyResponse.valid(
                serial.getProduct()
        );
    }

    /**
     * 사용자 제품 최종 등록
     */
    @Transactional
    public UserProductCreateResponse registerProduct(
            Long userId,
            UserProductCreateRequest request
    ) {

        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        // 2. 시리얼 조회
        ProductSerial serial = productSerialRepository
                .findBySerialNumber(request.getSerialNumber())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "유효하지 않은 시리얼 번호입니다."
                        )
                );

        /*
         * verifySerial()과 동일하게
         * 이미 등록 여부를 먼저 검사
         */
        if (userProductRepository.existsBySerial_Id(serial.getId())) {
            throw new IllegalArgumentException(
                    "이미 등록된 시리얼 번호입니다."
            );
        }

        // 비활성화된 시리얼
        if (!serial.isActive()) {
            throw new IllegalArgumentException(
                    "등록할 수 없는 시리얼 번호입니다."
            );
        }

        // 3. 먼저 생성한 아트워크 조회
        ArtworkCertificate artwork = artworkCertificateRepository
                .findById(request.getArtworkId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "아트워크를 찾을 수 없습니다."
                        )
                );

        // 4. 아트워크 생성 완료 여부 확인
        if (artwork.getStatus() != ArtworkStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "완료된 아트워크만 등록할 수 있습니다."
            );
        }

        // 5. 이미 다른 UserProduct에 연결된 아트워크인지 확인
        if (artwork.getUserProduct() != null) {
            throw new IllegalArgumentException(
                    "이미 등록된 아트워크입니다."
            );
        }

        // 6. 시리얼 상품과 아트워크 상품 일치 여부 확인
        if (!artwork.getProduct().getId()
                .equals(serial.getProduct().getId())) {

            throw new IllegalArgumentException(
                    "아트워크와 등록하려는 상품이 일치하지 않습니다."
            );
        }

        // 7. 구매 사연 확인
        if (request.getStoryContent() == null
                || request.getStoryContent().isBlank()) {

            throw new IllegalArgumentException(
                    "구매 사연을 입력해 주세요."
            );
        }

        // 8. UserProduct 생성
        UserProduct userProduct = UserProduct.create(
                user,
                serial,
                request.getPurchaseDate()
        );

        userProductRepository.save(userProduct);

        // 9. 구매 사연 저장
        PurchaseStory story = PurchaseStory.create(
                userProduct,
                request.getStoryContent()
        );

        purchaseStoryRepository.save(story);

        // 10. 감정 저장
        List<Emotion> emotions = request.getEmotions();

        if (emotions != null && !emotions.isEmpty()) {

            List<StoryEmotion> storyEmotions = emotions.stream()
                    .distinct()
                    .map(emotion ->
                            StoryEmotion.create(
                                    story,
                                    emotion
                            )
                    )
                    .toList();

            storyEmotionRepository.saveAll(storyEmotions);
        }

        // 11. 미리 생성한 Artwork와 최종 UserProduct 연결
        artwork.assignUserProduct(userProduct);

        // 12. 사용한 시리얼 비활성화
        serial.deactivate();

        return UserProductCreateResponse.from(
                userProduct
        );
    }
}
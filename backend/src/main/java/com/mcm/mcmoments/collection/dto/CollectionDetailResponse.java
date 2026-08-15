package com.mcm.mcmoments.collection.dto;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.ProductSerial;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.story.entity.Emotion;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * COL-002 컬렉션 상세 조회 결과를 응답 JSON 형태로 변환하는 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class CollectionDetailResponse {

    private Long artworkId;
    private String artworkUrl;
    private ProductInfo product;
    private StoryInfo story;
    private LocalDateTime createdAt;

    public static CollectionDetailResponse from(
            ArtworkCertificate artwork,
            PurchaseStory story,
            List<StoryEmotion> storyEmotions
    ) {
        UserProduct userProduct = artwork.getUserProduct();

        return new CollectionDetailResponse(
                artwork.getId(),
                artwork.getArtworkUrl(),
                ProductInfo.from(userProduct),
                story == null ? null : StoryInfo.from(story, storyEmotions),
                artwork.getCreatedAt()
        );
    }

    /**
     * 상품 기본 정보와 사용자가 등록한 구매 정보를 함께 담습니다.
     */
    @Getter
    @AllArgsConstructor
    public static class ProductInfo {

        private Long id;
        private String name;
        private String model;
        private String color;
        private String category;
        private String serialNumber;
        private LocalDate purchaseDate;
        private LocalDateTime registeredAt;

        private static ProductInfo from(UserProduct userProduct) {
            ProductSerial serial = userProduct.getSerial();
            Product product = serial.getProduct();

            return new ProductInfo(
                    product.getId(),
                    product.getName(),
                    product.getModel(),
                    product.getColor(),
                    product.getCategory(),
                    serial.getSerialNumber(),
                    userProduct.getPurchaseDate(),
                    userProduct.getRegisteredAt()
            );
        }
    }

    /**
     * 구매 사연이 있을 때만 생성되며, 감정 enum은 JSON에서 문자열로 반환됩니다.
     */
    @Getter
    @AllArgsConstructor
    public static class StoryInfo {

        private String content;
        private List<Emotion> emotions;

        private static StoryInfo from(
                PurchaseStory story,
                List<StoryEmotion> storyEmotions
        ) {
            List<Emotion> emotions = storyEmotions.stream()
                    .map(StoryEmotion::getEmotion)
                    .toList();

            return new StoryInfo(story.getContent(), emotions);
        }
    }
}

package com.mcm.mcmoments.collection.dto;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.product.entity.UserProduct;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * COL-001 응답 JSON의 최상위 items 배열을 표현하는 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class CollectionListResponse {

    private List<Item> items;

    public static CollectionListResponse from(
            List<ArtworkCertificate> artworks
    ) {
        List<Item> items = artworks.stream()
                .map(Item::from)
                .toList();

        return new CollectionListResponse(items);
    }

    /**
     * 컬렉션 목록에서 작품 하나를 표현하는 JSON 항목입니다.
     */
    @Getter
    @AllArgsConstructor
    public static class Item {

        private Long artworkId;
        private Long userProductId;
        private String productName;
        private LocalDateTime registeredAt;

        private static Item from(
                ArtworkCertificate artwork
        ) {
            UserProduct userProduct = artwork.getUserProduct();

            return new Item(
                    artwork.getId(),
                    userProduct.getId(),
                    userProduct.getProduct().getName(),
                    userProduct.getRegisteredAt()
            );
        }
    }
}

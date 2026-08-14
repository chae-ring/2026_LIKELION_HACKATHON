package com.mcm.mcmoments.collection.repository;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.entity.StoryEmotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * ArtworkCertificate를 기준으로 컬렉션 데이터를 DB에서 조회합니다.
 */
public interface CollectionRepository
        extends JpaRepository<ArtworkCertificate, Long> {

    /**
     * fetch join으로 UserProduct, ProductSerial, Product를 한 번에 조회해
     * 연관 데이터를 항목마다 다시 조회하는 N+1 문제를 줄입니다.
     */
    @Query("""
            select artwork
            from ArtworkCertificate artwork
            join fetch artwork.userProduct userProduct
            join fetch userProduct.serial serial
            join fetch serial.product product
            where userProduct.user.id = :userId
            order by userProduct.registeredAt desc
            """)
    List<ArtworkCertificate> findAllByUserId(
            @Param("userId") Long userId
    );

    /**
     * 작품 소유자까지 조건에 포함하고, 상세 응답에 필요한 상품 관계를 한 번에 조회합니다.
     */
    @Query("""
            select artwork
            from ArtworkCertificate artwork
            join fetch artwork.userProduct userProduct
            join fetch userProduct.serial serial
            join fetch serial.product product
            where artwork.id = :artworkId
              and userProduct.user.id = :userId
            """)
    Optional<ArtworkCertificate> findDetailByArtworkIdAndUserId(
            @Param("artworkId") Long artworkId,
            @Param("userId") Long userId
    );

    /**
     * PurchaseStory에는 UserProduct가 연결되어 있으므로 UserProduct ID로 사연을 찾습니다.
     */
    @Query("""
            select story
            from PurchaseStory story
            where story.userProduct.id = :userProductId
            """)
    Optional<PurchaseStory> findStoryByUserProductId(
            @Param("userProductId") Long userProductId
    );

    /**
     * 감정 저장 순서를 일정하게 반환하기 위해 StoryEmotion ID 오름차순으로 조회합니다.
     */
    @Query("""
            select storyEmotion
            from StoryEmotion storyEmotion
            where storyEmotion.story.id = :storyId
            order by storyEmotion.id asc
            """)
    List<StoryEmotion> findEmotionsByStoryIdOrderByIdAsc(
            @Param("storyId") Long storyId
    );
}

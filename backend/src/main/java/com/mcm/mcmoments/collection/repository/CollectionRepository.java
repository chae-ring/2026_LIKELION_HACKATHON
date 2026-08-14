package com.mcm.mcmoments.collection.repository;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
}

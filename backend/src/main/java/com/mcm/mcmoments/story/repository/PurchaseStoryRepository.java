package com.mcm.mcmoments.story.repository;

import com.mcm.mcmoments.story.entity.PurchaseStory;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * PurchaseStory Entity를 DB에 저장하고 조회하는 Repository입니다.
 * JpaRepository를 상속하면 save, findById 같은 기본 DB 기능을 Spring Data JPA가 제공합니다.
 */
public interface PurchaseStoryRepository
        extends JpaRepository<PurchaseStory, Long> {

    /**
     * userProduct.id를 기준으로 이미 저장된 스토리가 있는지 확인하는 쿼리를 자동 생성합니다.
     */
    boolean existsByUserProduct_Id(Long userProductId);
}

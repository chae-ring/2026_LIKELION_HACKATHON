package com.mcm.mcmoments.story.repository;

import com.mcm.mcmoments.story.entity.PurchaseStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PurchaseStoryRepository
        extends JpaRepository<PurchaseStory, Long> {

    // STORY-001에서 이미 등록된 스토리가 있는지 확인합니다.
    boolean existsByUserProduct_Id(Long userProductId);

    // userProductId로 구매 스토리를 조회합니다.
    Optional<PurchaseStory> findByUserProductId(Long userProductId);
}

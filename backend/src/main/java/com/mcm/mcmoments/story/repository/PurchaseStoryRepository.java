package com.mcm.mcmoments.story.repository;

import com.mcm.mcmoments.story.entity.PurchaseStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PurchaseStoryRepository extends JpaRepository<PurchaseStory, Long> {

    Optional<PurchaseStory> findByUserProductId(Long userProductId);
}

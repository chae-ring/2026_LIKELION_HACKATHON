package com.mcm.mcmoments.story.repository;

import com.mcm.mcmoments.story.entity.StoryEmotion;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * StoryEmotion Entity를 DB에 저장하고 조회하는 Repository입니다.
 * StoryService에서는 JpaRepository가 제공하는 saveAll을 사용해 여러 감정을 함께 저장합니다.
 */
public interface StoryEmotionRepository
        extends JpaRepository<StoryEmotion, Long> {
}

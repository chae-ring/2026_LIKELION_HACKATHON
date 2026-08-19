package com.mcm.mcmoments.story.repository;

import com.mcm.mcmoments.story.entity.StoryEmotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryEmotionRepository
        extends JpaRepository<StoryEmotion, Long> {
}
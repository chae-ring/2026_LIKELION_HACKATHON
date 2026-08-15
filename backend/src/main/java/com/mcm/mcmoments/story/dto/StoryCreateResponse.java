package com.mcm.mcmoments.story.dto;

import com.mcm.mcmoments.story.entity.Emotion;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * STORY-001 응답 JSON의 모양을 정의하는 DTO입니다.
 * {@code @Getter}는 JSON 변환에 필요한 getter를 만들고,
 * {@code @AllArgsConstructor}는 모든 응답 필드를 받는 생성자를 만들어 줍니다.
 */
@Getter
@AllArgsConstructor
public class StoryCreateResponse {

    private Long storyId;
    private Long userProductId;
    private String content;
    private List<Emotion> emotions;
    private LocalDateTime createdAt;

    /**
     * DB Entity와 저장에 사용한 감정 목록을 프론트에 전달할 응답 DTO로 변환합니다.
     */
    public static StoryCreateResponse from(
            PurchaseStory story,
            List<Emotion> emotions
    ) {
        return new StoryCreateResponse(
                story.getId(),
                story.getUserProduct().getId(),
                story.getContent(),
                emotions,
                story.getCreatedAt()
        );
    }
}

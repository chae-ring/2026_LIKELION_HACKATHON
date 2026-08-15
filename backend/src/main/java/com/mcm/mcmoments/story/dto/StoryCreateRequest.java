package com.mcm.mcmoments.story.dto;

import com.mcm.mcmoments.story.entity.Emotion;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * STORY-001 요청 JSON을 담는 DTO입니다.
 * Jackson이 content와 emotions를 같은 이름의 필드에 채우며,
 * {@code @NoArgsConstructor}는 JSON을 Java 객체로 만들 때 사용할 기본 생성자를 제공합니다.
 * Emotion enum에 없는 문자열은 변환할 수 없으므로 Controller 진입 전에 잘못된 요청으로 처리됩니다.
 */
@Getter
@NoArgsConstructor
public class StoryCreateRequest {

    // 사용자가 작성한 구매 이야기입니다.
    private String content;

    // JSON 배열의 "PRIDE", "JOY" 등을 Emotion enum 목록으로 받습니다.
    private List<Emotion> emotions;
}

package com.mcm.mcmoments.story.controller;

import com.mcm.mcmoments.story.dto.StoryCreateRequest;
import com.mcm.mcmoments.story.dto.StoryCreateResponse;
import com.mcm.mcmoments.story.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 구매 스토리와 관련된 HTTP 요청을 받는 API 진입점입니다.
 * {@code @RestController}는 메서드의 반환값을 JSON 응답으로 변환하고,
 * {@code @RequestMapping}은 이 Controller가 공통으로 사용할 URL 앞부분을 지정합니다.
 * {@code @RequiredArgsConstructor}는 final 필드인 StoryService를 받는 생성자를 만들어 줍니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user-products")
public class StoryController {

    private final StoryService storyService;

    /**
     * URL의 userProductId와 요청 JSON의 content, emotions를 받아 스토리를 생성합니다.
     * {@code @PathVariable}은 URL 값을, {@code @RequestBody}는 JSON 본문을 Java 객체로 변환합니다.
     */
    @PostMapping("/{userProductId}/story")
    public ResponseEntity<StoryCreateResponse> createStory(
            @PathVariable("userProductId") Long userProductId,
            @RequestBody StoryCreateRequest request
    ) {

        StoryCreateResponse response =
                storyService.createStory(
                        userProductId,
                        request
                );

        return ResponseEntity.ok(response);
    }
}

package com.mcm.mcmoments.recommendation.controller;

import com.mcm.mcmoments.recommendation.dto.RecommendationListResponse;
import com.mcm.mcmoments.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class RecommendationController {

    private final RecommendationService recommendationService;

    // GET /api/v1/users/{userId}/recommendations
    @GetMapping("/users/{userId}/recommendations")
    public RecommendationListResponse getUserRecommendations(@PathVariable Long userId) {
        return recommendationService.getRecommendationsByUserId(userId);
    }
}

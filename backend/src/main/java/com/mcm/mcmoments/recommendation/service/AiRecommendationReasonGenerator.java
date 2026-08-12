package com.mcm.mcmoments.recommendation.service;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class AiRecommendationReasonGenerator {

    private final RestClient restClient;
    private final String apiKey;

    public AiRecommendationReasonGenerator(
            @Value("${openai.api-key:}") String apiKey
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
        this.apiKey = apiKey;
    }

    public String generateReason(Product baseProduct, Product targetProduct, PurchaseStory story) {
        if (apiKey == null || apiKey.isBlank()) {
            return getDefaultFallbackReason(baseProduct, targetProduct);
        }

        try {
            String systemPrompt = "당신은 명품 MCM 브랜드의 수석 스타일 컨설턴트입니다. "
                    + "고객이 기존에 보유한 가방과 그 가방에 담긴 추억/사연을 고려하여, 추천 상품을 구매해야 하는 품격 있고 당위성 있는 추천 이유(reason)를 한국어 1~2문장으로 매끄럽고 고급스럽게 작성해 주세요. "
                    + "설명조나 존댓말(~합니다, ~해줍니다)로 명확하고 설득력 있게 작성해야 합니다.";

            String storyText = (story != null && story.getContent() != null) ? story.getContent() : "특별한 기억이 담긴 MCM 가방";

            String userPrompt = String.format(
                    "보유 제품: %s (%s, %s 색상)\n"
                            + "고객 사연: %s\n"
                            + "추천 대상 제품: %s (%s, %s 색상)\n"
                            + "위 보유 제품 및 사연과 자연스럽게 매칭되는 추천 이유 1~2문장을 작성해 주세요.",
                    baseProduct.getName(), baseProduct.getCategory(), baseProduct.getColor(),
                    storyText,
                    targetProduct.getName(), targetProduct.getCategory(), targetProduct.getColor()
            );

            ChatRequest request = new ChatRequest(
                    "gpt-4o-mini",
                    List.of(
                            new ChatMessage("system", systemPrompt),
                            new ChatMessage("user", userPrompt)
                    ),
                    0.7,
                    150
            );

            ChatResponse response = restClient.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ChatResponse.class);

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                String aiReason = response.choices().get(0).message().content().trim();
                log.info("Successfully generated AI recommendation reason: {}", aiReason);
                return aiReason;
            }
        } catch (Exception e) {
            log.warn("Failed to generate AI reason with OpenAI: {}. Using default reason.", e.getMessage());
        }

        return getDefaultFallbackReason(baseProduct, targetProduct);
    }

    private String getDefaultFallbackReason(Product baseProduct, Product targetProduct) {
        if (targetProduct.getCategory().equalsIgnoreCase(baseProduct.getCategory())) {
            return String.format("등록하신 %s의 Visetos 패턴과 자연스럽게 이어져 컬렉션에 통일감을 더해줍니다.", baseProduct.getName());
        } else {
            return String.format("기존 %s와 다른 실루엣을 더하면서도 동일한 MCM 무드를 유지할 수 있습니다.", baseProduct.getCategory());
        }
    }

    private record ChatRequest(
            String model,
            List<ChatMessage> messages,
            double temperature,
            int max_tokens
    ) {}

    private record ChatMessage(
            String role,
            String content
    ) {}

    private record ChatResponse(
            List<ChatChoice> choices
    ) {}

    private record ChatChoice(
            ChatMessage message
    ) {}
}

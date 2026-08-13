package com.mcm.mcmoments.recommendation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.recommendation.dto.ProductRecommendationDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AiRecommendationReasonGenerator {

    private final RestClient restClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public AiRecommendationReasonGenerator(
            @Value("${openai.api-key:}") String apiKey
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(120000);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
        this.apiKey = apiKey;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 사용자의 전체 소장품과 DB의 검증된 후보 상품 목록을 입력받아,
     * AI 분석 후 가장 추천할 만한 3개의 productId와 추천 이유를 Map 형태로 반환합니다.
     */
    public Map<Long, String> generateCollectionBasedRecommendations(
            List<UserProduct> userProducts,
            List<Product> candidates
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return new HashMap<>();
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key is not set. Returning first 3 candidates.");
            Map<Long, String> fallback = new HashMap<>();
            candidates.stream().limit(3).forEach(p -> 
                fallback.put(p.getId(), "고객님의 MCM 컬렉션을 한층 업그레이드해 줄 아이템입니다.")
            );
            return fallback;
        }

        try {
            String ownedProductsText = userProducts.stream()
                    .map(up -> String.format("- %s (카테고리: %s, 색상: %s, 시즌: %s)",
                            up.getProduct().getName(),
                            up.getProduct().getCategory(),
                            up.getProduct().getColor(),
                            up.getProduct().getSeason()))
                    .collect(Collectors.joining("\n"));

            if (ownedProductsText.isBlank()) {
                ownedProductsText = "현재 등록된 상품이 없습니다.";
            }

            StringBuilder candidateText = new StringBuilder();
            for (Product p : candidates) {
                candidateText.append(String.format("- ProductId: %d | %s (카테고리: %s, 색상: %s, 시즌: %s)\n",
                        p.getId(), p.getName(), p.getCategory(), p.getColor(), p.getSeason()));
            }

            String inputPrompt = String.format(
                    "당신은 MCM 공식 스타일 컨설턴트입니다.\n"
                    + "아래 고객이 현재 소장 중인 MCM 전체 컬렉션을 분석하여, 추가했을 때 가장 높은 가치와 다양성을 제공할 수 있는 상품을 추천해야 합니다.\n\n"
                    + "【고객 소장품】\n%s\n\n"
                    + "【추천 후보 (DB 마스터)】\n%s\n\n"
                    + "【작업 지시】\n"
                    + "1. 고객의 전체 컬렉션을 분석하고, 특징을 파악하세요.\n"
                    + "2. 중복되는 아이템(예: 이미 백팩이 많은데 또 백팩 추천)은 지양하고, 새로운 카테고리나 실루엣을 추가하여 컬렉션의 다양성을 높이는 상품을 추천 후보 중에서 고르세요.\n"
                    + "3. 후보 중에서 가장 적합한 TOP 3를 선정하세요.\n"
                    + "4. 반드시 아래 JSON 형식으로만 응답하세요.\n"
                    + "{\n"
                    + "  \"recommendations\": [\n"
                    + "    {\n"
                    + "      \"productId\": 123,\n"
                    + "      \"reason\": \"현재 백팩 중심의 컬렉션에 새로운 실루엣을 추가하여...\"\n"
                    + "    }\n"
                    + "  ]\n"
                    + "}\n"
                    + "5. productId는 추천 후보 목록에 있는 ID만 사용해야 합니다. (절대 창작 불가)\n"
                    + "6. reason은 전체 소장품 구성을 근거로 구체적으로 작성하세요.",
                    ownedProductsText,
                    candidateText.toString()
            );

            String requestJson = objectMapper.writeValueAsString(Map.of(
                    "model", "gpt-4o-mini",
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are a helpful AI assistant that outputs strictly in JSON."),
                            Map.of("role", "user", "content", inputPrompt)
                    ),
                    "response_format", Map.of("type", "json_object")
            ));

            log.info("Calling OpenAI API for AI Collection Analysis...");

            String responseJson = restClient.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            String aiContent = root.path("choices").get(0).path("message").path("content").asText();

            JsonNode aiJson = objectMapper.readTree(aiContent);
            JsonNode recsNode = aiJson.path("recommendations");

            Map<Long, String> result = new HashMap<>();
            if (recsNode.isArray()) {
                for (JsonNode rec : recsNode) {
                    long pid = rec.path("productId").asLong();
                    String reason = rec.path("reason").asText();
                    if (pid > 0 && !reason.isBlank()) {
                        result.put(pid, reason);
                    }
                }
            }
            
            if (!result.isEmpty()) {
                return result;
            }

        } catch (Exception e) {
            log.error("Failed to analyze collection with OpenAI: {}", e.getMessage(), e);
        }

        // Fallback
        Map<Long, String> fallback = new HashMap<>();
        candidates.stream().limit(3).forEach(p -> 
            fallback.put(p.getId(), "고객님의 전체 MCM 컬렉션과 잘 어울리는 아이템입니다.")
        );
        return fallback;
    }

    /**
     * Web Search 기능을 활용하여 보유하지 않은 새로운 MCM 상품 후보군을 검색합니다.
     */
    public List<ProductRecommendationDto> findNewProductsViaWebSearch(List<UserProduct> ownedProducts) {
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }

        try {
            String ownedProductsText = ownedProducts.stream()
                    .map(up -> String.format("- %s (카테고리: %s)", up.getProduct().getName(), up.getProduct().getCategory()))
                    .collect(Collectors.joining("\n"));

            String inputPrompt = String.format(
                    "당신은 MCM 공식 데이터 검색 어시스턴트입니다.\n"
                    + "【고객 소장품】\n%s\n\n"
                    + "【작업 지시】\n"
                    + "1. 고객의 소장품을 제외한 '새로운 카테고리'의 MCM 신상품 3개를 kr.mcmworldwide.com 또는 mcmworldwide.com 도메인에서 찾아주세요.\n"
                    + "2. 제품명, 카테고리, 시즌(예: 2026 S/S 등), imageUrl, productUrl(공식몰 링크)을 수집하세요.\n"
                    + "3. (중요) 만약 실시간 웹 검색이 불가능하더라도, 당신의 사전 학습된 지식을 바탕으로 실제로 존재하는 유명한 MCM 상품 3개를 생성해 주세요. 반드시 도메인은 mcmworldwide.com 이어야 하며, imageUrl은 .jpg 등으로 끝나야 합니다.\n"
                    + "4. 결과는 반드시 아래 JSON 형식으로 응답하세요. 다른 설명은 일절 추가하지 마세요.\n"
                    + "{\n"
                    + "  \"products\": [\n"
                    + "    {\n"
                    + "      \"name\": \"상품명\",\n"
                    + "      \"category\": \"카테고리\",\n"
                    + "      \"season\": \"시즌\",\n"
                    + "      \"imageUrl\": \"실제 이미지 URL\",\n"
                    + "      \"productUrl\": \"실제 공식몰 상품 URL\"\n"
                    + "    }\n"
                    + "  ]\n"
                    + "}",
                    ownedProductsText.isBlank() ? "소장품 없음" : ownedProductsText
            );

            String requestJson = objectMapper.writeValueAsString(Map.of(
                    "model", "gpt-4o",
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are a helpful AI assistant that outputs strictly in JSON."),
                            Map.of("role", "user", "content", inputPrompt)
                    ),
                    "response_format", Map.of("type", "json_object")
            ));

            log.info("Calling OpenAI Chat Completions API to find new products...");

            String responseJson = restClient.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            log.info("Response from OpenAI: {}", responseJson);

            JsonNode root = objectMapper.readTree(responseJson);
            String outputText = root.path("choices").get(0).path("message").path("content").asText();

            if (outputText.isBlank()) {
                log.warn("Web search output_text is blank.");
                return List.of();
            }

            // AI가 JSON 코드블럭으로 응답할 수 있으므로 정제
            if (outputText.contains("```json")) {
                outputText = outputText.substring(outputText.indexOf("```json") + 7);
                if (outputText.contains("```")) {
                    outputText = outputText.substring(0, outputText.indexOf("```"));
                }
            }

            JsonNode aiJson = objectMapper.readTree(outputText);
            JsonNode productsNode = aiJson.path("products");

            List<ProductRecommendationDto> list = new ArrayList<>();
            if (productsNode.isArray()) {
                for (JsonNode node : productsNode) {
                    list.add(new ProductRecommendationDto(
                            node.path("name").asText(""),
                            node.path("category").asText("Accessory"),
                            node.path("season").asText("2026 S/S"),
                            node.path("imageUrl").asText(""),
                            "Web Search Candidate",
                            node.path("productUrl").asText("")
                    ));
                }
            }

            return list;

        } catch (Exception e) {
            log.error("Failed to find new products via web search: {}", e.getMessage());
            return List.of();
        }
    }
}

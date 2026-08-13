package com.mcm.mcmoments.recommendation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcm.mcmoments.product.dto.NewProductCandidate;
import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.UserProduct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * OpenAI를 이용해 (1) 사용자 컬렉션 기반 추천 이유를 생성하고,
 * (2) 카탈로그에 없는 신상품 후보를 mcmworldwide.com 대상 실시간 웹 검색으로 찾는 컴포넌트.
 *
 * 두 기능 모두 실패 시 예외를 던지지 않고 빈 결과를 반환한다.
 * 호출부(RecommendationService, ProductDiscoveryService)가 각자의 폴백 전략을 책임진다.
 *
 * discoverNewCatalogProducts는 더 이상 사용자 요청 경로(RecommendationService)에서 호출되지 않는다.
 * MCM 공식몰의 봇 차단(WAF) 때문에 매 요청마다 호출하면 지연시간(수십 초)과 신뢰성 문제가 컸다.
 * 지금은 ProductDiscoveryService(오프라인 배치, spring.profiles.active=discovery)에서만 호출된다.
 */
@Slf4j
@Component
public class AiRecommendationReasonGenerator {

    private final RestClient restClient;
    private final RestClient discoveryRestClient;
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

        // 실제 웹 검색 + 종합에는 20~60초 이상 걸릴 수 있어 넉넉하게 잡는다. (25초로는 타임아웃 실패가 잦았음)
        SimpleClientHttpRequestFactory discoveryFactory = new SimpleClientHttpRequestFactory();
        discoveryFactory.setConnectTimeout(10000);
        discoveryFactory.setReadTimeout(75000);
        this.discoveryRestClient = RestClient.builder()
                .requestFactory(discoveryFactory)
                .build();

        this.apiKey = apiKey;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 사용자의 전체 소장품과 DB의 검증된 후보 상품 목록(제한 없이 전체)을 입력받아,
     * AI가 직접 top3을 "선정"하고 추천 이유까지 작성해 Map(productId -> reason) 형태로 반환한다.
     *
     * 후보를 서비스단에서 미리 3개로 줄이지 말고 그대로 넘길 것 — AI가 다양성을 판단할 여지가 있어야 한다.
     * 반환되는 Map은 AI가 응답한 순서(= 추천 우선순위)를 그대로 보존한다(LinkedHashMap).
     *
     * @return AI 호출이 실패하거나 API 키가 없으면 빈 Map을 반환한다. (호출부가 폴백을 처리한다)
     */
    public Map<Long, String> generateCollectionBasedRecommendations(
            List<UserProduct> userProducts,
            List<Product> candidates
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return new LinkedHashMap<>();
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key is not set. Skipping AI recommendation (caller will fall back).");
            return new LinkedHashMap<>();
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
                    + "6. recommendations 배열의 순서가 추천 우선순위입니다. 가장 추천하는 상품을 먼저 배치하세요.\n"
                    + "7. reason은 전체 소장품 구성을 근거로 구체적으로 작성하세요.",
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

            Map<Long, String> result = new LinkedHashMap<>();
            if (recsNode.isArray()) {
                for (JsonNode rec : recsNode) {
                    long pid = rec.path("productId").asLong();
                    String reason = rec.path("reason").asText();
                    if (pid > 0 && !reason.isBlank()) {
                        result.put(pid, reason);
                    }
                }
            }

            return result;

        } catch (Exception e) {
            log.error("Failed to analyze collection with OpenAI: {}", e.getMessage(), e);
            return new LinkedHashMap<>();
        }
    }

    /**
     * 아직 카탈로그(products 테이블)에 없는 신상품을 OpenAI Responses API의 web_search 툴로
     * 실제로 검색해서 제안한다. 검색은 mcmworldwide.com 도메인으로 강제 제한된다(filters.allowed_domains
     * — 프롬프트 지시가 아니라 API 레벨에서 강제되는 값이라 훨씬 신뢰할 수 있다).
     *
     * 주의: 실제 검색 결과라도 반환된 URL은 검증되지 않은 상태다. 호출부(ProductDiscoveryService)가
     * 반드시 URL 유효성을 다시 검증한 뒤에만 카탈로그에 반영해야 한다. 오프라인 배치에서만 호출되지만,
     * 그래도 예외를 던지지 않는 편이 배치 운영상 안전하다.
     *
     * @return 검색이 실패하거나 API 키가 없으면 빈 리스트를 반환한다.
     */
    public List<NewProductCandidate> discoverNewCatalogProducts(List<String> existingProductNames) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key is not set. Skipping new product discovery.");
            return List.of();
        }

        try {
            String existingText = (existingProductNames == null || existingProductNames.isEmpty())
                    ? "현재 카탈로그가 비어 있습니다."
                    : existingProductNames.stream().map(name -> "- " + name).collect(Collectors.joining("\n"));

            String inputPrompt = String.format(
                    "당신은 MCM 공식 상품 데이터베이스 큐레이터입니다. 웹 검색 도구를 사용해 mcmworldwide.com 공식 홈페이지에서 "
                    + "실제로 판매 중인 상품을 찾아주세요.\n"
                    + "아래는 현재 우리 카탈로그에 이미 등록된 상품 목록입니다. 이 목록에 없는 상품 후보를 최대 3개까지 검색해서 제안해 주세요.\n\n"
                    + "【기존 카탈로그】\n%s\n\n"
                    + "【작업 지시】\n"
                    + "1. 반드시 웹 검색 결과에서 실제로 확인한 상품만 제안하세요. 검색 결과가 불충분하면 3개보다 적게 제안하거나 빈 목록을 반환해도 됩니다.\n"
                    + "2. productUrl은 검색 결과에서 실제로 확인된 상품 상세 페이지 URL만 사용하세요. 절대 URL을 지어내지 마세요.\n"
                    + "3. imageUrl은 알면 적어주되, 확신할 수 없으면 빈 문자열(\"\")로 남기세요. (서버가 상품 페이지에서 대표 이미지를 다시 확인합니다)\n"
                    + "4. 검색과 확인이 끝나면, 다른 설명 없이 아래 JSON 형식의 코드블록 하나만 응답하세요.\n"
                    + "```json\n"
                    + "{\n"
                    + "  \"products\": [\n"
                    + "    {\n"
                    + "      \"name\": \"상품명\",\n"
                    + "      \"category\": \"카테고리\",\n"
                    + "      \"color\": \"대표 색상\",\n"
                    + "      \"season\": \"시즌 (예: 2026 S/S)\",\n"
                    + "      \"imageUrl\": \"이미지 URL 또는 빈 문자열\",\n"
                    + "      \"productUrl\": \"공식몰 상품 URL\"\n"
                    + "    }\n"
                    + "  ]\n"
                    + "}\n"
                    + "```",
                    existingText
            );

            String requestJson = objectMapper.writeValueAsString(Map.of(
                    "model", "gpt-5.6",
                    "tools", List.of(Map.of(
                            "type", "web_search",
                            "filters", Map.of("allowed_domains", List.of("mcmworldwide.com"))
                    )),
                    "input", inputPrompt
            ));

            log.info("[discovery] Calling OpenAI Responses API (web_search) to discover new catalog products...");

            String responseJson = discoveryRestClient.post()
                    .uri("https://api.openai.com/v1/responses")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            String messageText = extractMessageText(responseJson);
            if (messageText == null || messageText.isBlank()) {
                log.warn("[discovery] Responses API에서 메시지 본문을 찾지 못했습니다.");
                return List.of();
            }

            String jsonText = extractJsonBlock(messageText);
            JsonNode aiJson = objectMapper.readTree(jsonText);
            JsonNode productsNode = aiJson.path("products");

            List<NewProductCandidate> result = new ArrayList<>();
            if (productsNode.isArray()) {
                for (JsonNode node : productsNode) {
                    String name = node.path("name").asText("");
                    String imageUrl = node.path("imageUrl").asText("");
                    String productUrl = node.path("productUrl").asText("");

                    // imageUrl은 검색 스니펫만으로는 AI가 못 찾는 경우가 흔하므로 필수로 요구하지 않는다.
                    // (호출부가 productUrl 페이지의 og:image를 스크래핑해 보완한다) productUrl은 반드시 있어야 한다.
                    if (name.isBlank() || productUrl.isBlank()) {
                        log.info("[discovery] 상품 URL이 없는 후보는 건너뜁니다: {}", name);
                        continue;
                    }

                    result.add(new NewProductCandidate(
                            name,
                            node.path("category").asText("Accessory"),
                            node.path("color").asText(""),
                            node.path("season").asText("2026 S/S"),
                            imageUrl,
                            productUrl
                    ));
                }
            }

            return result;

        } catch (Exception e) {
            log.error("[discovery] Failed to discover new catalog products via web search: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Responses API 응답(JSON)에서 output 배열 중 type="message"인 아이템의 텍스트 본문을 꺼낸다.
     * 파싱에 실패하면 null을 반환한다(예외를 던지지 않음).
     */
    private String extractMessageText(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode outputArray = root.path("output");
            if (!outputArray.isArray()) {
                return null;
            }

            for (JsonNode item : outputArray) {
                if (!"message".equals(item.path("type").asText())) {
                    continue;
                }
                JsonNode content = item.path("content");
                if (content.isArray()) {
                    for (JsonNode part : content) {
                        String text = part.path("text").asText(null);
                        if (text != null && !text.isBlank()) {
                            return text;
                        }
                    }
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 모델 응답 텍스트에서 ```json 코드블록 또는 첫 {..} 구간을 뽑아낸다.
     */
    private String extractJsonBlock(String text) {
        String trimmed = text.trim();
        int fenceStart = trimmed.indexOf("```json");
        if (fenceStart >= 0) {
            int contentStart = fenceStart + 7;
            int fenceEnd = trimmed.indexOf("```", contentStart);
            if (fenceEnd > contentStart) {
                return trimmed.substring(contentStart, fenceEnd).trim();
            }
        }
        int objectStart = trimmed.indexOf('{');
        int objectEnd = trimmed.lastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart) {
            return trimmed.substring(objectStart, objectEnd + 1);
        }
        return trimmed;
    }
}

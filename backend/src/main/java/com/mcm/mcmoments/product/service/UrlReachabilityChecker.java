package com.mcm.mcmoments.product.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * URL이 실제로 존재하는 리소스인지 판단하고, 상품 페이지에서 대표 이미지를 보완해주는 공용 컴포넌트.
 *
 * AI(오프라인 발굴 파이프라인이든, 실시간 추천 경로든)가 제안한 상품 URL을 카탈로그에 반영하거나
 * 사용자에게 노출하기 전에는 반드시 이 검증을 거쳐야 한다.
 *
 * 주의(실측 확인됨): mcmworldwide.com 같은 대형 브랜드몰은 봇 차단(WAF)이 걸려 있어, 일반 Java HTTP
 * 클라이언트의 요청은 실제로 존재하는 상품 URL에도 403이나 연결 리셋으로 응답하는 경우가 흔하다.
 * 그래서 "요청이 200으로 성공했는가"가 아니라 "이 URL이 실제로 존재하는 리소스로 보이는가"를 기준으로
 * 판단한다:
 *   - 2xx/3xx            → 확실히 존재
 *   - 401/403/405/429 등  → 차단/제한된 것뿐, 리소스 자체는 존재하는 것으로 간주
 *   - 404/410            → 존재하지 않음(진짜로 버릴 근거)
 *   - 타임아웃/연결 실패    → 판단 불가. web_search가 실제로 서버 측에서 페이지를 확인하고 인용한
 *                          URL이라는 점을 신뢰하여 존재하는 것으로 간주하되 로그를 남긴다.
 * 즉 이 검증의 목적은 "AI가 URL을 완전히 지어냈는지"를 걸러내는 것이지, 우리 서버가 지금 그 페이지를
 * 성공적으로 통째로 받아올 수 있는지를 보장하는 것이 아니다.
 */
@Slf4j
@Component
public class UrlReachabilityChecker {

    private static final String BROWSER_USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
    private static final String BROWSER_ACCEPT =
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

    private static final Pattern OG_IMAGE_TAG = Pattern.compile(
            "<meta[^>]*(?:property|name)=[\"'](?:og:image|twitter:image)[\"'][^>]*>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern CONTENT_ATTR = Pattern.compile(
            "content=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

    private final RestClient client = buildClient(4000, 4000);
    private final RestClient pageContentClient = buildClient(5000, 8000);

    /**
     * URL이 실제로 존재하는 리소스로 보이는지 확인한다. 위 클래스 주석의 판단 기준을 따른다.
     */
    public boolean isReachable(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }

        Boolean head = checkExists(url, HttpMethod.HEAD);
        if (head != null) {
            return head;
        }

        // HEAD 결과가 애매하면(예: 405) GET으로 한 번 더 확인한다.
        Boolean get = checkExists(url, HttpMethod.GET);
        return get == null || get;
    }

    /**
     * AI가 제안한 imageUrl이 있고 존재하면 그대로 쓰고, 없거나 존재하지 않으면(404 등) productPageUrl을
     * 직접 가져와 og:image/twitter:image 메타 태그에서 이미지를 보완한다.
     *
     * @return 최종적으로 사용할 이미지 URL. 어떤 방법으로도 못 구하면 empty.
     */
    public Optional<String> resolveImageUrl(String candidateImageUrl, String productPageUrl) {
        if (candidateImageUrl != null && !candidateImageUrl.isBlank() && isReachable(candidateImageUrl)) {
            return Optional.of(candidateImageUrl);
        }
        return fetchOgImage(productPageUrl);
    }

    /**
     * 상품 페이지 HTML을 가져와 og:image(또는 twitter:image) 메타 태그의 content 값을 추출한다.
     * 실패하면(네트워크 오류, 태그 없음, 봇 차단 등) 예외를 던지지 않고 empty를 반환한다.
     */
    public Optional<String> fetchOgImage(String pageUrl) {
        if (pageUrl == null || pageUrl.isBlank()) {
            return Optional.empty();
        }

        try {
            String html = pageContentClient.get()
                    .uri(pageUrl)
                    .header(HttpHeaders.USER_AGENT, BROWSER_USER_AGENT)
                    .header(HttpHeaders.ACCEPT, BROWSER_ACCEPT)
                    .retrieve()
                    .body(String.class);

            if (html == null || html.isBlank()) {
                return Optional.empty();
            }

            Matcher tagMatcher = OG_IMAGE_TAG.matcher(html);
            if (tagMatcher.find()) {
                Matcher contentMatcher = CONTENT_ATTR.matcher(tagMatcher.group());
                if (contentMatcher.find()) {
                    String imageUrl = contentMatcher.group(1);
                    if (imageUrl != null && !imageUrl.isBlank()) {
                        return Optional.of(imageUrl);
                    }
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            log.debug("og:image 추출 실패(봇 차단이거나 태그 없음일 수 있음): {} ({})", pageUrl, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * @return true = 존재함, false = 존재하지 않음(404/410), null = 애매함(405 등, 호출부가 재시도 판단)
     */
    private Boolean checkExists(String url, HttpMethod method) {
        try {
            client.method(method)
                    .uri(url)
                    .header(HttpHeaders.USER_AGENT, BROWSER_USER_AGENT)
                    .header(HttpHeaders.ACCEPT, BROWSER_ACCEPT)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 404 || status == 410) {
                log.info("URL이 존재하지 않는 것으로 판정(HTTP {}): {} {}", status, method, url);
                return false;
            }
            if (status == 405) {
                // 이 메서드 자체를 허용하지 않는 것뿐, 리소스 존재 여부는 알 수 없음 -> 재시도 유도
                return null;
            }
            log.debug("URL 접근이 차단됐지만(HTTP {}) 리소스는 존재하는 것으로 간주: {} {}", status, method, url);
            return true;
        } catch (Exception e) {
            log.debug("URL 확인 중 네트워크 오류(타임아웃/연결실패 등) - 존재하는 것으로 간주: {} {} ({})",
                    method, url, e.getMessage());
            return true;
        }
    }

    private static RestClient buildClient(int connectTimeoutMs, int readTimeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }
}

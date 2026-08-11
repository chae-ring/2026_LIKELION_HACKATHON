package com.mcm.mcmoments.artwork.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@Primary
public class OpenAiArtworkImageGenerator implements ArtworkImageGenerator {

    private final RestClient restClient;
    private final String apiKey;

    public OpenAiArtworkImageGenerator(
            @Value("${openai.api-key:}") String apiKey
    ) {
        this.restClient = RestClient.builder().build();
        this.apiKey = apiKey;
    }

    @Override
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key is missing. Falling back to default mock artwork.");
            return getFallbackArtworkUrl(prompt);
        }

        try {
            log.info("Attempting DALL-E 3 artwork generation with prompt: {}", prompt);
            return callDalleApi("dall-e-3", prompt, "1024x1024");
        } catch (RestClientResponseException e) {
            log.warn("DALL-E 3 call failed with status [{}]: {}. Trying DALL-E 2...", e.getStatusCode(), e.getResponseBodyAsString());
            try {
                return callDalleApi("dall-e-2", prompt, "1024x1024");
            } catch (Exception ex) {
                log.error("DALL-E 2 call also failed. (OpenAI account tier/credits issue). Using fallback artwork URL.", ex);
                return getFallbackArtworkUrl(prompt);
            }
        } catch (Exception e) {
            log.error("Failed to generate OpenAI artwork image. Using fallback artwork URL.", e);
            return getFallbackArtworkUrl(prompt);
        }
    }

    private String callDalleApi(String model, String prompt, String size) {
        DalleRequest requestBody = new DalleRequest(model, prompt, 1, size);

        DalleResponse response = restClient.post()
                .uri("https://api.openai.com/v1/images/generations")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(DalleResponse.class);

        if (response != null && response.data() != null && !response.data().isEmpty()) {
            String imageUrl = response.data().get(0).url();
            log.info("Successfully generated DALL-E [{}] artwork image: {}", model, imageUrl);
            return imageUrl;
        } else {
            throw new IllegalStateException("No image URL received from OpenAI API");
        }
    }

    private String getFallbackArtworkUrl(String prompt) {
        return "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080";
    }

    private record DalleRequest(
            String model,
            String prompt,
            int n,
            String size
    ) {}

    private record DalleResponse(
            long created,
            List<DalleData> data
    ) {}

    private record DalleData(
            String url,
            String revised_prompt
    ) {}
}

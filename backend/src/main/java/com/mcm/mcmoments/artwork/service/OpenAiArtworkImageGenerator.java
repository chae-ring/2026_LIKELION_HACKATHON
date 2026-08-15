package com.mcm.mcmoments.artwork.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

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
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(120000);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
        this.apiKey = apiKey;
    }

    @Override
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenAI API key is missing");
        }

        log.info("Attempting gpt-image-2 artwork generation with prompt: {}", prompt);
        return callDalleApi("gpt-image-2", prompt, "1024x1024");
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
            String imageReference = extractImageReference(response);
            log.info("Successfully generated OpenAI [{}] artwork image: {}", model, imageReference);
            return imageReference;
        } else {
            throw new IllegalStateException("No image URL received from OpenAI API");
        }
    }

    private String extractImageReference(DalleResponse response) {
        DalleData image = response.data().get(0);

        if (image.url() != null && !image.url().isBlank()) {
            return image.url();
        }

        if (image.b64_json() != null && !image.b64_json().isBlank()) {
            String mimeType = switch (response.output_format() == null ? "png" : response.output_format().toLowerCase()) {
                case "jpeg", "jpg" -> "image/jpeg";
                case "webp" -> "image/webp";
                default -> "image/png";
            };
            return "data:" + mimeType + ";base64," + image.b64_json();
        }

        throw new IllegalStateException("No image content received from OpenAI API");
    }

    private record DalleRequest(
            String model,
            String prompt,
            int n,
            String size
    ) {}

    private record DalleResponse(
            long created,
            String output_format,
            List<DalleData> data
    ) {}

    private record DalleData(
            String b64_json,
            String url,
            String revised_prompt
    ) {}
}

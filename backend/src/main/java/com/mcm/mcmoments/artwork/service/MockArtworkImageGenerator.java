package com.mcm.mcmoments.artwork.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@Profile("!production")
public class MockArtworkImageGenerator implements ArtworkImageGenerator {

    @Override
    public String generate(String prompt) {
        String label = URLEncoder.encode("MCM Moments artwork", StandardCharsets.UTF_8);
        return "https://placehold.co/1080x1350/1f2937/FFFFFF/png?text=" + label;
    }
}

package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.repository.ArtworkCertificateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ArtworkGenerationProcessor {

    private final ArtworkCertificateRepository artworkRepository;
    private final ArtworkImageGenerator artworkImageGenerator;

    @Async
    @Transactional
    public void generate(Long artworkId) {
        ArtworkCertificate artwork = artworkRepository.findById(artworkId)
                .orElseThrow();

        try {
            log.info("Starting generation for artworkId: {}", artworkId);
            artwork.complete(artworkImageGenerator.generate(artwork.getPrompt()));
        } catch (Exception exception) {
            log.error("Failed to generate artwork for artworkId: {}", artworkId, exception);
            artwork.fail();
        }
    }
}

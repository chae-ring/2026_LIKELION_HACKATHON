package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.artwork.dto.ArtworkResponse;
import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.repository.ArtworkCertificateRepository;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.story.repository.PurchaseStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ArtworkService {

    private final ArtworkCertificateRepository artworkRepository;
    private final UserProductRepository userProductRepository;
    private final PurchaseStoryRepository purchaseStoryRepository;
    private final ArtworkPromptFactory artworkPromptFactory;
    private final ArtworkGenerationProcessor artworkGenerationProcessor;

    @Transactional
    public ArtworkResponse requestGeneration(Long userProductId) {
        UserProduct userProduct = userProductRepository.findById(userProductId)
                .orElseThrow(() -> notFound("등록된 제품을 찾을 수 없습니다."));
        PurchaseStory story = purchaseStoryRepository.findByUserProductId(userProductId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "구매 사연을 먼저 등록해 주세요."));

        String prompt = artworkPromptFactory.create(userProduct, story);
        ArtworkCertificate artwork = artworkRepository.findByUserProductId(userProductId)
                .map(existing -> {
                    existing.retry(prompt);
                    return existing;
                })
                .orElseGet(() -> ArtworkCertificate.create(userProduct, prompt));

        ArtworkCertificate savedArtwork = artworkRepository.saveAndFlush(artwork);
        artworkGenerationProcessor.generate(savedArtwork.getId());
        return ArtworkResponse.from(savedArtwork);
    }

    @Transactional(readOnly = true)
    public ArtworkResponse getArtwork(Long artworkId) {
        ArtworkCertificate artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> notFound("아트워크를 찾을 수 없습니다."));
        return ArtworkResponse.from(artwork);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}

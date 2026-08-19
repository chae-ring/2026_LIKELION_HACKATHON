package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.artwork.dto.ArtworkResponse;
import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.repository.ArtworkCertificateRepository;
import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.repository.ProductRepository;
import com.mcm.mcmoments.story.entity.Emotion;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtworkService {

    private final ArtworkCertificateRepository artworkRepository;
    private final ProductRepository productRepository;
    private final ArtworkPromptFactory artworkPromptFactory;
    private final ArtworkGenerationProcessor artworkGenerationProcessor;

    @Transactional
    public ArtworkResponse requestGeneration(
            Long productId,
            String storyContent,
            List<Emotion> emotions
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        notFound("제품을 찾을 수 없습니다.")
                );

        if (storyContent == null || storyContent.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "구매 사연을 입력해 주세요."
            );
        }

        String prompt = artworkPromptFactory.create(
                product,
                storyContent,
                emotions
        );

        ArtworkCertificate artwork =
                ArtworkCertificate.create(
                        product,
                        prompt
                );

        ArtworkCertificate savedArtwork =
                artworkRepository.saveAndFlush(artwork);

        // 트랜잭션이 커밋되기 전에 비동기 생성 스레드가 먼저 조회를 시도하면
        // NoSuchElementException이 발생하므로, 커밋 완료 후에만 실행되도록 등록한다.
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        artworkGenerationProcessor.generate(savedArtwork.getId());
                    }
                }
        );

        return ArtworkResponse.from(savedArtwork);
    }

    @Transactional(readOnly = true)
    public ArtworkResponse getArtwork(Long artworkId) {

        ArtworkCertificate artwork =
                artworkRepository.findById(artworkId)
                        .orElseThrow(() ->
                                notFound("아트워크를 찾을 수 없습니다.")
                        );

        return ArtworkResponse.from(artwork);
    }

    @Transactional(readOnly = true)
    public ArtworkImageContent getArtworkImage(Long artworkId) {

        ArtworkCertificate artwork =
                artworkRepository.findById(artworkId)
                        .orElseThrow(() ->
                                notFound("아트워크를 찾을 수 없습니다.")
                        );

        String artworkUrl = artwork.getArtworkUrl();

        if (artworkUrl == null || artworkUrl.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "아트워크 이미지를 찾을 수 없습니다."
            );
        }

        return ArtworkImageContent.from(artworkUrl);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                message
        );
    }

    public record ArtworkImageContent(
            byte[] bytes,
            MediaType contentType
    ) {

        public static ArtworkImageContent from(
                String artworkUrl
        ) {

            if (artworkUrl.startsWith("data:")) {
                return fromDataUri(artworkUrl);
            }

            if (artworkUrl.startsWith("http://")
                    || artworkUrl.startsWith("https://")) {

                return fromRemoteUrl(artworkUrl);
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "지원하지 않는 이미지 형식입니다."
            );
        }

        private static ArtworkImageContent fromDataUri(
                String dataUri
        ) {

            int commaIndex = dataUri.indexOf(',');

            if (commaIndex < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "잘못된 data URI 형식입니다."
                );
            }

            String metadata =
                    dataUri.substring(5, commaIndex);

            String base64Data =
                    dataUri.substring(commaIndex + 1);

            String mimeType = "image/png";

            if (!metadata.isBlank()) {

                int semicolonIndex =
                        metadata.indexOf(';');

                mimeType =
                        semicolonIndex >= 0
                                ? metadata.substring(
                                        0,
                                        semicolonIndex
                                )
                                : metadata;
            }

            return new ArtworkImageContent(
                    Base64.getDecoder()
                            .decode(base64Data),
                    MediaType.parseMediaType(mimeType)
            );
        }

        private static ArtworkImageContent fromRemoteUrl(
                String remoteUrl
        ) {

            try {

                URLConnection connection =
                        new URL(remoteUrl)
                                .openConnection();

                connection.setConnectTimeout(5000);
                connection.setReadTimeout(120000);

                MediaType contentType =
                        MediaType.IMAGE_PNG;

                if (connection.getContentType() != null
                        && !connection
                                .getContentType()
                                .isBlank()) {

                    contentType =
                            MediaType.parseMediaType(
                                    connection
                                            .getContentType()
                            );
                }

                try (InputStream inputStream =
                             connection.getInputStream()) {

                    return new ArtworkImageContent(
                            inputStream.readAllBytes(),
                            contentType
                    );
                }

            } catch (IOException exception) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "이미지를 불러오지 못했습니다."
                );
            }
        }
    }
}
package com.mcm.mcmoments.artwork.controller;

import com.mcm.mcmoments.artwork.dto.ArtworkCreateRequest;
import com.mcm.mcmoments.artwork.dto.ArtworkResponse;
import com.mcm.mcmoments.artwork.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ArtworkController {

    private final ArtworkService artworkService;

    @PostMapping("/products/{productId}/artworks")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ArtworkResponse createArtwork(
            @PathVariable("productId") Long productId,
            @RequestBody ArtworkCreateRequest request
    ) {
        return artworkService.requestGeneration(
                productId,
                request.storyContent()
        );
    }

    @GetMapping("/artworks/{artworkId}")
    public ArtworkResponse getArtwork(
            @PathVariable("artworkId") Long artworkId
    ) {
        return artworkService.getArtwork(artworkId);
    }

    @GetMapping("/artworks/{artworkId}/image")
    public ResponseEntity<byte[]> getArtworkImage(
            @PathVariable("artworkId") Long artworkId
    ) {

        ArtworkService.ArtworkImageContent imageContent =
                artworkService.getArtworkImage(artworkId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=artwork-" + artworkId
                )
                .contentType(
                        imageContent.contentType() == null
                                ? MediaType.APPLICATION_OCTET_STREAM
                                : imageContent.contentType()
                )
                .body(imageContent.bytes());
    }
}
package com.mcm.mcmoments.artwork.controller;

import com.mcm.mcmoments.artwork.dto.ArtworkResponse;
import com.mcm.mcmoments.artwork.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ArtworkController {

    private final ArtworkService artworkService;

    @PostMapping("/user-products/{userProductId}/artworks")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ArtworkResponse createArtwork(@PathVariable Long userProductId) {
        return artworkService.requestGeneration(userProductId);
    }

    @GetMapping("/artworks/{artworkId}")
    public ArtworkResponse getArtwork(@PathVariable Long artworkId) {
        return artworkService.getArtwork(artworkId);
    }

    @GetMapping("/artworks/{artworkId}/image")
    public ResponseEntity<byte[]> getArtworkImage(@PathVariable Long artworkId) {
        ArtworkService.ArtworkImageContent imageContent = artworkService.getArtworkImage(artworkId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=artwork-" + artworkId)
                .contentType(imageContent.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM : imageContent.contentType())
                .body(imageContent.bytes());
    }
}

package com.mcm.mcmoments.artwork.controller;

import com.mcm.mcmoments.artwork.dto.ArtworkResponse;
import com.mcm.mcmoments.artwork.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
}

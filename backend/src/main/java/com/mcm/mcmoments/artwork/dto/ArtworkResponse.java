package com.mcm.mcmoments.artwork.dto;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.entity.ArtworkStatus;

import java.time.LocalDateTime;

public record ArtworkResponse(
        Long artworkId,
        Long userProductId,
        ArtworkStatus status,
        String artworkUrl,
        LocalDateTime createdAt
) {
    public static ArtworkResponse from(ArtworkCertificate artwork) {
        String artworkUrl = artwork.getArtworkUrl();
        if (artwork.getStatus() == ArtworkStatus.COMPLETED && artworkUrl != null && !artworkUrl.isBlank()) {
            artworkUrl = "/api/v1/artworks/" + artwork.getId() + "/image";
        }

        return new ArtworkResponse(
                artwork.getId(),
                artwork.getUserProduct().getId(),
                artwork.getStatus(),
                artworkUrl,
                artwork.getCreatedAt()
        );
    }
}

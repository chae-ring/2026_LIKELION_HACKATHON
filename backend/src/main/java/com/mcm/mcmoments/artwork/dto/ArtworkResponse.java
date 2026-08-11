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
        return new ArtworkResponse(
                artwork.getId(),
                artwork.getUserProduct().getId(),
                artwork.getStatus(),
                artwork.getArtworkUrl(),
                artwork.getCreatedAt()
        );
    }
}

package com.mcm.mcmoments.artwork.dto;

import com.mcm.mcmoments.story.entity.Emotion;

import java.util.List;

public record ArtworkCreateRequest(
        String storyContent,
        List<Emotion> emotions
) {
}

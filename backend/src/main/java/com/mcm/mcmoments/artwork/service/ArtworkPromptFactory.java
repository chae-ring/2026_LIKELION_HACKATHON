package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.product.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ArtworkPromptFactory {

    public String create(
            Product product,
            String storyContent
    ) {

        String category = product.getCategory();
        String name = product.getName();
        String color = product.getColor();

        return String.format(
                "A museum-quality 3D digital artwork for a luxury MCM %s named '%s' in %s. "
                        + "Background features a rich, heavy classic Cognac leather texture with subtly embossed Visetos monogram pattern. "
                        + "Over the leather surface, vibrant metallic fluid art—sculpted in rose gold, champagne gold, and deep navy metallic paint—flows smoothly and freezes into a tactile 3D liquid form. "
                        + "The piece elegantly captures the owner's personal emotion and memory: '%s'. "
                        + "High-end luxury editorial photography, 3D relief texture, soft studio lighting, ultra-refined luxury aesthetic, 8k resolution.",
                category,
                name,
                color,
                storyContent
        );
    }
}
package com.mcm.mcmoments.product.dto;

import com.mcm.mcmoments.story.entity.Emotion;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class UserProductCreateRequest {

    private String serialNumber;
    private LocalDate purchaseDate;
    private Long artworkId;

    private String storyContent;
    private List<Emotion> emotions;
}
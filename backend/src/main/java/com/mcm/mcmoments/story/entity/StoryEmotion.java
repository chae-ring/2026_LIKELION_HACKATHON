package com.mcm.mcmoments.story.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "story_emotions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_story_emotions_story_emotion",
                        columnNames = {"story_id", "emotion"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoryEmotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "story_id", nullable = false)
    private PurchaseStory story;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Emotion emotion;

    private StoryEmotion(
            PurchaseStory story,
            Emotion emotion
    ) {
        this.story = story;
        this.emotion = emotion;
    }

    public static StoryEmotion create(
            PurchaseStory story,
            Emotion emotion
    ) {
        return new StoryEmotion(story, emotion);
    }
}
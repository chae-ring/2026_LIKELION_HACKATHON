package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.story.entity.Emotion;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ArtworkPromptFactory {

    private record MotionProfile(
            String motionAdjective,
            String flowVerbPhrase,
            String lightAdjective
    ) {}

    // 활기찬 감정: 메탈릭 플루이드가 역동적으로 튀는 모션
    private static final MotionProfile ENERGETIC = new MotionProfile(
            "vibrant, dynamic",
            "sweeps and splashes energetically across",
            "bright, radiant"
    );

    // 차분한 감정: 메탈릭 플루이드가 느리게 고이는 모션
    private static final MotionProfile CALM = new MotionProfile(
            "soft, slow-pooling",
            "gently drifts and settles across",
            "warm, softly diffused"
    );

    // 감정이 없거나 판단 불가할 때의 기본값(기존 프롬프트와 동일한 톤)
    private static final MotionProfile DEFAULT_PROFILE = new MotionProfile(
            "vibrant",
            "flows smoothly across",
            "soft"
    );

    private static final Set<Emotion> ENERGETIC_EMOTIONS = Set.of(
            Emotion.JOY, Emotion.EXCITEMENT, Emotion.PRIDE, Emotion.ACHIEVEMENT,
            Emotion.CONFIDENCE, Emotion.SURPRISE, Emotion.ANTICIPATION, Emotion.HAPPINESS
    );

    private static final Set<Emotion> CALM_EMOTIONS = Set.of(
            Emotion.GRATITUDE, Emotion.SATISFACTION, Emotion.LOVE, Emotion.AFFECTION,
            Emotion.NOSTALGIA, Emotion.COMFORT, Emotion.RELIEF, Emotion.SENTIMENTAL
    );

    // 감정 이름을 그대로 문장에 나열해서 모델이 감정 단어 자체도 인지하게 한다.
    private static final Map<Emotion, String> EMOTION_LABELS = Map.ofEntries(
            Map.entry(Emotion.JOY, "joy"),
            Map.entry(Emotion.PRIDE, "pride"),
            Map.entry(Emotion.EXCITEMENT, "excitement"),
            Map.entry(Emotion.GRATITUDE, "gratitude"),
            Map.entry(Emotion.HAPPINESS, "happiness"),
            Map.entry(Emotion.SATISFACTION, "satisfaction"),
            Map.entry(Emotion.LOVE, "love"),
            Map.entry(Emotion.AFFECTION, "affection"),
            Map.entry(Emotion.NOSTALGIA, "nostalgia"),
            Map.entry(Emotion.COMFORT, "comfort"),
            Map.entry(Emotion.CONFIDENCE, "confidence"),
            Map.entry(Emotion.ACHIEVEMENT, "achievement"),
            Map.entry(Emotion.RELIEF, "relief"),
            Map.entry(Emotion.SURPRISE, "surprise"),
            Map.entry(Emotion.ANTICIPATION, "anticipation"),
            Map.entry(Emotion.SENTIMENTAL, "sentimentality")
    );

    public String create(
            Product product,
            String storyContent,
            List<Emotion> emotions
    ) {

        String category = product.getCategory();
        String name = product.getName();
        String color = product.getColor();

        MotionProfile motion = resolveMotionProfile(emotions);
        String emotionLabelClause = buildEmotionLabelClause(emotions);

        return String.format(
                "Create a museum-quality 3D digital artwork whose entire mood, color palette, and composition "
                        + "are driven by the owner's personal memory below — treat the memory as the emotional "
                        + "brief for the artwork, not as text to render:\n"
                        + "\"%s\"\n\n"
                        + "The artwork centers on a luxury MCM %s named '%s' in %s. "
                        + "Background is a rich, heavy classic Cognac leather texture with a subtly embossed "
                        + "Visetos monogram pattern. %s metallic fluid art — in rose gold, champagne gold, "
                        + "and deep navy metallic paint — %s the leather and freezes into a tactile "
                        + "3D liquid form.%s "
                        + "High-end luxury editorial photography, 3D relief texture, %s studio lighting, "
                        + "ultra-refined luxury aesthetic, 8k resolution. "
                        + "Do not render any text, letters, or captions anywhere in the image.",
                storyContent,
                category,
                name,
                color,
                capitalize(motion.motionAdjective()),
                motion.flowVerbPhrase(),
                emotionLabelClause,
                motion.lightAdjective()
        );
    }

    private MotionProfile resolveMotionProfile(List<Emotion> emotions) {
        if (emotions == null || emotions.isEmpty()) {
            return DEFAULT_PROFILE;
        }

        long energeticCount = emotions.stream().filter(ENERGETIC_EMOTIONS::contains).count();
        long calmCount = emotions.stream().filter(CALM_EMOTIONS::contains).count();

        if (energeticCount == 0 && calmCount == 0) {
            return DEFAULT_PROFILE;
        }

        return energeticCount >= calmCount ? ENERGETIC : CALM;
    }

    private String buildEmotionLabelClause(List<Emotion> emotions) {
        if (emotions == null || emotions.isEmpty()) {
            return "";
        }

        String labels = emotions.stream()
                .map(emotion -> EMOTION_LABELS.getOrDefault(emotion, emotion.name().toLowerCase()))
                .distinct()
                .collect(Collectors.joining(" and "));

        return " Let the overall feeling of " + labels + " shine through in every visual detail.";
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}

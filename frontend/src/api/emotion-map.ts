import type { EmotionCode } from "./types"

// 백엔드 Emotion enum 전체에 대응하는 한글 라벨
// (지금 UI에서 선택 가능한 건 4개뿐이지만, 조회 시 다른 값이 올 수도 있어 전체를 매핑해둠)
export const EMOTION_LABEL: Record<EmotionCode, string> = {
  JOY: "기쁨",
  PRIDE: "자부심",
  EXCITEMENT: "설렘",
  GRATITUDE: "감사",
  HAPPINESS: "행복",
  SATISFACTION: "만족",
  LOVE: "애정",
  AFFECTION: "애착",
  NOSTALGIA: "추억",
  COMFORT: "편안함",
  CONFIDENCE: "자신감",
  ACHIEVEMENT: "성취감",
  RELIEF: "안도감",
  SURPRISE: "놀라움",
  ANTICIPATION: "기대감",
  SENTIMENTAL: "뭉클함",
}

// UI에서 실제로 선택 가능한 4개 감정만 역매핑
const KOREAN_TO_CODE: Record<string, EmotionCode> = {
  기쁨: "JOY",
  자부심: "PRIDE",
  설렘: "EXCITEMENT",
  감사: "GRATITUDE",
}

export function emotionCodeToKorean(code: EmotionCode): string {
  return EMOTION_LABEL[code] ?? code
}

export function koreanToEmotionCode(label: string): EmotionCode {
  return KOREAN_TO_CODE[label] ?? "JOY"
}

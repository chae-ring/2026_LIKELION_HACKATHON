// COL-002가 백엔드에서 받아오는 감정 값은 story/entity/Emotion.java enum
// (JOY, PRIDE 등 영문)이라, 화면 표시용으로 한글로 바꿔주는 매핑.
// STORY-001 입력 쪽 Emotion 타입(한글, 효빈님 담당)과는 별개로 관리함.
const LABEL: Record<string, string> = {
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

export function toEmotionLabel(code: string): string {
  return LABEL[code] ?? code
}

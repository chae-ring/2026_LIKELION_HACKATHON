import { useState } from "react"

import PrimaryButton from "../../components/common/PrimaryButton"

import StepIndicator from "../../components/common/StepIndicator"

import TopBar from "../../components/common/TopBar"


import type { Emotion } from "../../types"

export default function StoryStepScreen({

  onBack,

  onNext,
}: {
  onBack: () => void

  onNext: (story: string, emotions: Emotion[]) => void
}) {
  const [story, setStory] = useState("")

  const [emotions, setEmotions] = useState<Emotion[]>([])

  const [error, setError] = useState("")


  const EMOTIONS: Emotion[] = [
  "기쁨", "자부심", "설렘", "감사",
  "행복", "만족", "애정", "애착",
  "추억", "편안함", "자신감", "성취감",
  "안도감", "놀라움", "기대감", "뭉클함",
]


  const MAX = 500

  const MIN = 20

  const toggleEmotion = (e: Emotion) => {
    setEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    )
  }

  const handleNext = () => {
    if (story.length < MIN) {
      setError(`최소 ${MIN}자 이상 작성해 주세요. (현재 ${story.length}자)`)

      return
    }

    if (emotions.length === 0) {
      setError("감정을 하나 이상 선택해 주세요.")

      return
    }

    setError("")
    onNext(story, emotions)
  }
  return (
    <div
      className="fade-up"
      style={{
        minHeight: "100vh",

        background: "var(--cream)",

        display: "flex",

        flexDirection: "column",
      }}
    >
      <TopBar onBack={onBack} />
      <StepIndicator step={2} />

      <div style={{ padding: "28px 24px 0" }}>
        <p
          style={{
            margin: "0 0 4px",

            fontFamily: "Outfit, sans-serif",

            fontSize: 11,

            letterSpacing: "0.15em",

            color: "var(--brown-light)",

            textTransform: "uppercase",
          }}
        >
          Step 2
        </p>
        <h2
          style={{
            margin: 0,

            fontFamily: "Playfair Display, serif",

            fontSize: 22,

            fontWeight: 500,

            color: "var(--brown)",

            lineHeight: 1.3,
          }}
        >
          이 제품을 선택한 순간을 들려주세요
        </h2>
      </div>

      <div style={{ padding: "28px 24px 0", flex: 1 }}>
        {/* Textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            value={story}
            onChange={(e) => {
              setStory(e.target.value.slice(0, MAX))

              setError("")
            }}
            placeholder="졸업 선물로 스스로에게 처음 선물한 가방이에요. 오랫동안 모아온 돈으로 구입한 순간, 말로 표현할 수 없는 뿌듯함이 밀려왔습니다!"
            rows={6}
            style={{
              width: "100%",

              padding: "14px 16px",

              fontFamily: "Outfit, sans-serif",

              fontSize: 14,

              lineHeight: 1.7,

              background: "var(--warm-white)",

              border: `1px solid ${error ? "#c0392b" : "var(--border)"}`,

              borderRadius: 2,

              color: "var(--brown)",

              outline: "none",

              resize: "none",
            }}
          />
          <div
            style={{
              position: "absolute",

              bottom: 12,

              right: 14,

              fontFamily: "Outfit, sans-serif",

              fontSize: 11,

              color: story.length >= MIN ? "var(--brown-light)" : "#c0392b",
            }}
          >
            {story.length} / {MAX}
          </div>
        </div>
        {error && (
          <p
            style={{
              margin: "8px 0 0",

              fontFamily: "Outfit, sans-serif",

              fontSize: 12,

              color: "#c0392b",
            }}
          >
            {error}
          </p>
        )}

        {/* Emotion chips */}
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              margin: "0 0 12px",

              fontFamily: "Outfit, sans-serif",

              fontSize: 11,

              color: "var(--brown)",

              letterSpacing: "0.1em",

              textTransform: "uppercase",
            }}
          >
            담긴 감정 선택
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EMOTIONS.map((e) => {
              const active = emotions.includes(e)

              return (
                <button
                  key={e}
                  onClick={() => toggleEmotion(e)}
                  style={{
                    padding: "10px 18px",

                    background: active ? "var(--brown)" : "transparent",

                    color: active ? "var(--warm-white)" : "var(--brown)",

                    border: `1px solid ${
                      active ? "var(--brown)" : "var(--border)"
                    }`,

                    borderRadius: 40,

                    cursor: "pointer",

                    fontFamily: "Outfit, sans-serif",

                    fontSize: 14,

                    fontWeight: 500,

                    transition: "all 0.2s ease",
                  }}
                >
                  {e}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", marginTop: "auto" }}>
        <PrimaryButton
          onClick={handleNext}
          disabled={story.length < MIN}
        >
          아트워크 만들기
        </PrimaryButton>
      </div>
    </div>
  )
}

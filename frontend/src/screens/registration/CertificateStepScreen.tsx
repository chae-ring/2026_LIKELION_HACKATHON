import { useEffect, useRef, useState } from "react"
import CertificateCard from "../../components/certificate/CertificateCard"
import PrimaryButton from "../../components/common/PrimaryButton"
import SecondaryButton from "../../components/common/SecondaryButton"
import StepIndicator from "../../components/common/StepIndicator"
import TopBar from "../../components/common/TopBar"
import VisetosPattern from "../../components/decoration/VisetosPattern"
import { ARTWORK_URLS } from "../../constants/artworks"
import { RECOMMENDED } from "../../constants/recommendations"
import { CARE_TIPS, WARRANTY_STATUS_LABEL } from "../../constants/warranty"
import type { Certificate, Emotion, Product } from "../../types"
import { formatDate } from "../../utils/date"
import { getWarrantyInfo } from "../../utils/warranty"

export default function CertificateStepScreen({
  product,

  story,

  emotions,

  onNext,

  onBack,
}: {
  product: Product

  story: string

  emotions: Emotion[]

  onNext: (cert: Certificate) => void

  onBack: () => void
}) {
  const [phase, setPhase] = useState<"loading" | "success" | "fail">("loading")

  const [cert, setCert] = useState<Certificate | null>(null)

  useEffect(() => {
    const t = setTimeout(
      () => {
        // Simulate 90% success

        if (Math.random() < 0.9) {
          const now = new Date()

          const c: Certificate = {
            product,

            story,

            emotions,

            artworkUrl:
              ARTWORK_URLS[Math.floor(Math.random() * ARTWORK_URLS.length)],

            createdAt: formatDate(now),

            registeredAt: now,
          }

          setCert(c)

          setPhase("success")
        } else {
          setPhase("fail")
        }
      },
      2800,
    )

    return () => clearTimeout(t)
  }, [])

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
      <StepIndicator step={3} />

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
          Step 3
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: "Playfair Display, serif",
            fontSize: 26,
            fontWeight: 500,
            color: "var(--brown)",
            lineHeight: 1.3,
          }}
        >
          {phase === "loading" && "아트워크를\n생성하고 있어요"}
          {phase === "success" && "당신의 아트워크가\n완성되었습니다"}
          {phase === "fail" && "아트워크를\n다시 만들어드릴게요"}
        </h2>
      </div>

      <div style={{ padding: "28px 24px 0", flex: 1 }}>
        {/* Loading state */}
        {phase === "loading" && (
          <div>
            {/* Skeleton */}
            <div
              className="skeleton"
              style={{
                background: "var(--brown)",
                borderRadius: 6,
                aspectRatio: "1/1",
                position: "relative",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <VisetosPattern />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                {/* Spinner */}
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <svg
                    className="spin-slow"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="rgba(184,146,74,0.2)"
                      strokeWidth="2"
                    />
                    <path
                      d="M24 4 A20 20 0 0 1 44 24"
                      stroke="#B8924A"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",

                      alignItems: "center",
                      justifyContent: "center",

                      fontFamily: "Playfair Display, serif",
                      fontSize: 18,
                      color: "var(--gold)",
                    }}
                  >
                    ✦
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "rgba(253,250,244,0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  Visetos 패턴 분석 중…
                </p>
              </div>
            </div>
            {/* Skeleton rows */}
            {[80, 55, 65].map((w, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: 14,
                  borderRadius: 2,
                  background: "var(--cream-dark)",
                  marginBottom: 10,
                  width: `${w}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Success */}
        {phase === "success" && cert && (
          <div className="fade-up">
            <CertificateCard cert={cert} />
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",

                background: "var(--cream-mid)",
                borderRadius: 2,

                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 16 }}>✅</span>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 12,
                  color: "var(--brown)",
                }}
              >
                내 컬렉션에 저장되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* Fail */}
        {phase === "fail" && (
          <div className="fade-up">
            <div
              style={{
                background: "var(--brown)",
                borderRadius: 6,
                padding: 28,

                position: "relative",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              <VisetosPattern />
              <div style={{ position: "relative", zIndex: 1 }}>
                <p
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 32,
                    color: "var(--gold)",
                    margin: "0 0 12px",
                  }}
                >
                  ✦
                </p>
                <p
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    color: "rgba(253,250,244,0.6)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  AI 생성 중 오류가 발생했습니다.
                  <br />
                  대체 아트워크를 준비했습니다.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <SecondaryButton
                onClick={() => {
                  setPhase("loading")
                  setTimeout(() => {
                    const now = new Date()
                    const c: Certificate = {
                      product,
                      story,
                      emotions,
                      artworkUrl: ARTWORK_URLS[1],
                      createdAt: formatDate(now),
                      registeredAt: now,
                    }
                    setCert(c)
                    setPhase("success")
                  }, 2000)
                }}
              >
                다시 만들기
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>

      {phase === "success" && cert && (
        <div style={{ padding: "24px", marginTop: "auto" }}>
          <PrimaryButton onClick={() => onNext(cert)}>
            추천 상품 보기
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

// 5. Recommendations


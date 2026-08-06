import { useEffect, useRef, useState } from "react"
import CertificateCard from "../components/certificate/CertificateCard"
import PrimaryButton from "../components/common/PrimaryButton"
import SecondaryButton from "../components/common/SecondaryButton"
import StepIndicator from "../components/common/StepIndicator"
import TopBar from "../components/common/TopBar"
import VisetosPattern from "../components/decoration/VisetosPattern"
import { ARTWORK_URLS } from "../constants/artworks"
import { RECOMMENDED } from "../constants/recommendations"
import { CARE_TIPS, WARRANTY_STATUS_LABEL } from "../constants/warranty"
import type { Certificate, Emotion, Product } from "../types"
import { formatDate } from "../utils/date"
import { getWarrantyInfo } from "../utils/warranty"

export default function RecommendationsScreen({
  onCollection,
  onBack,
}: {
  onCollection: () => void
  onBack: () => void
}) {
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
      <TopBar onBack={onBack} label="추천 상품" />

      <div style={{ padding: "28px 24px 0" }}>
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
          당신을 위한
          <br />
          다음 MCM
        </h2>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: "var(--brown-light)",
            lineHeight: 1.6,
          }}
        >
          등록하신 제품과 어울리는 2025 S/S 컬렉션을 선별했습니다.
        </p>
      </div>

      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
        }}
      >
        {RECOMMENDED.map((item, i) => (
          <div
            key={i}
            style={{
              background: "var(--warm-white)",
              borderRadius: 4,

              border: "1px solid var(--border)",
              overflow: "hidden",

              display: "flex",
              gap: 0,
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{ width: 110, flexShrink: 0, objectFit: "cover" }}
            />
            <div
              style={{
                padding: "16px 16px 16px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "var(--cream-dark)",

                      borderRadius: 2,
                      fontFamily: "Outfit, sans-serif",

                      fontSize: 9,
                      color: "var(--brown-mid)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      border: "1px solid var(--border)",

                      borderRadius: 2,
                      fontFamily: "Outfit, sans-serif",

                      fontSize: 9,
                      color: "var(--gold)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.season}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontFamily: "Playfair Display, serif",
                    fontSize: 15,
                    color: "var(--brown)",
                    fontWeight: 500,
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 11,
                    color: "var(--brown-light)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.reason}
                </p>
              </div>
              <button
                style={{
                  marginTop: 12,
                  padding: "8px 0",
                  background: "none",

                  border: "none",
                  borderBottom: "1px solid var(--brown)",

                  cursor: "pointer",
                  textAlign: "left",

                  fontFamily: "Outfit, sans-serif",
                  fontSize: 11,

                  color: "var(--brown)",
                  letterSpacing: "0.06em",
                }}
              >
                상품 자세히 보기 →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "8px 24px 40px" }}>
        <PrimaryButton onClick={onCollection}>
          My Collection으로 이동
        </PrimaryButton>
      </div>
    </div>
  )
}

// ─── AS 기간 계산 헬퍼 ────────────────────────────────────────────────────────

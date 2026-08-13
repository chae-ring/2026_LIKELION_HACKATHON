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

export default function HomeScreen({
  onStart,
  onCollection,
}: {
  onStart: () => void
  onCollection: () => void
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
      {/* Header brand */}
      <div style={{ padding: "48px 24px 0", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 13,

            letterSpacing: "0.35em",
            color: "var(--brown)",

            textTransform: "uppercase",
            margin: 0,
          }}
        >
          MCM
        </p>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 18,

            letterSpacing: "0.02em",
            color: "var(--brown)",

            margin: "4px 0 0",
            fontWeight: 500,
          }}
        >
          MC<span style={{ color: "var(--gold)" }}>M</span>oments
        </p>
      </div>

      {/* Hero text */}
      <div style={{ padding: "36px 28px 24px" }}>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",

            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.25,

            color: "var(--brown)",
            margin: 0,
          }}
        >
          나의 MCM
          <br />
          순간을
          <br />
          기록하세요
        </h1>
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 14,
            lineHeight: 1.7,

            color: "var(--brown-light)",
            margin: "14px 0 0",
          }}
        >
          첫 MCM 제품과의 특별한 순간을 AI가
          <br />
          Visetos 패턴으로 담은 디지털 아트워크로
          <br />
          영원히 간직하세요.
        </p>
      </div>

      {/* Preview certificate card */}
      <div style={{ padding: "0 24px", marginBottom: 32 }}>
        <div
          style={{
            background: "var(--brown)",
            borderRadius: 6,

            overflow: "hidden",
            position: "relative",

            aspectRatio: "3/2",
          }}
        >
          <VisetosPattern />
          <img
            src="https://images.unsplash.com/photo-1761437856299-af640f6e75ad?w=600&h=400&fit=crop&auto=format"
            alt="Sample digital artwork certificate"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
              mixBlendMode: "luminosity",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Playfair Display, serif",
                    fontSize: 11,
                    color: "var(--gold)",
                    letterSpacing: "0.2em",
                  }}
                >
                  MCM
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 8,
                    color: "rgba(253,250,244,0.4)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Digital Certificate
                </p>
              </div>
              <span
                style={{
                  border: "1px solid var(--gold)",
                  padding: "3px 8px",

                  fontFamily: "Outfit, sans-serif",
                  fontSize: 8,
                  color: "var(--gold)",

                  letterSpacing: "0.15em",
                }}
              >
                Sample
              </span>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontFamily: "Playfair Display, serif",
                  fontSize: 15,
                  color: "var(--warm-white)",
                  fontWeight: 500,
                }}
              >
                Stark Backpack Medium
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 10,
                  color: "rgba(253,250,244,0.4)",
                }}
              >
                MUK Visetos Original · Cognac
              </p>
            </div>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            margin: "10px 0 0",

            fontFamily: "Outfit, sans-serif",
            fontSize: 10,

            color: "var(--brown-light)",
            letterSpacing: "0.06em",
          }}
        >
          ↑ AI가 생성한 개인 맞춤 디지털 보증서 예시
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          padding: "0 24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: "auto",
        }}
      >
        <PrimaryButton onClick={onStart}>제품 등록 시작하기</PrimaryButton>
        <SecondaryButton onClick={onCollection}>
          My Collection 보기
        </SecondaryButton>
      </div>
    </div>
  )
}

// 2. Step 1 – Serial Number


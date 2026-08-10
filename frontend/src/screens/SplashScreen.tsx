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

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400)

    const t2 = setTimeout(() => setPhase("out"), 2200)

    const t3 = setTimeout(() => onDone(), 2700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,

        background: "var(--brown)",

        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",

        opacity: phase === "out" ? 0 : 1,

        transition:
          phase === "out"
            ? "opacity 0.5s ease"
            : phase === "in"
              ? "opacity 0.4s ease"
              : "none",

        overflow: "hidden",
      }}
    >
      {/* Visetos full-bleed */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        <VisetosPattern />
      </div>

      {/* Gold horizontal rule top */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 32,
          right: 32,

          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--gold), transparent)",

          opacity: phase === "hold" || phase === "out" ? 1 : 0,

          transition: "opacity 0.6s ease 0.3s",
        }}
      />

      {/* Center lockup */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,

          opacity: phase === "hold" || phase === "out" ? 1 : 0,

          transform:
            phase === "hold" || phase === "out"
              ? "translateY(0)"
              : "translateY(20px)",

          transition: "opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s",

          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Ornament */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          style={{ marginBottom: 20, opacity: 0.7 }}
        >
          <path
            d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z"
            fill="var(--gold)"
          />
        </svg>

        {/* MCM wordmark */}
        <p
          style={{
            margin: 0,

            fontFamily: "Playfair Display, serif",

            fontSize: 11,
            letterSpacing: "0.5em",

            color: "rgba(253,250,244,0.5)",

            textTransform: "uppercase",
          }}
        >
          MCM
        </p>

        {/* Service name */}
        <h1
          style={{
            margin: "6px 0 0",

            fontFamily: "Playfair Display, serif",

            fontSize: 42,
            fontWeight: 500,

            color: "var(--warm-white)",

            letterSpacing: "-0.01em",

            lineHeight: 1,
          }}
        >
          MC<span style={{ color: "var(--gold)" }}>M</span>oments
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: "14px 0 0",

            fontFamily: "Outfit, sans-serif",

            fontSize: 12,
            letterSpacing: "0.18em",

            color: "rgba(253,250,244,0.4)",

            textTransform: "uppercase",
          }}
        >
          Your Story. Your Legacy.
        </p>
      </div>

      {/* Gold horizontal rule bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          left: 32,
          right: 32,

          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--gold), transparent)",

          opacity: phase === "hold" || phase === "out" ? 1 : 0,

          transition: "opacity 0.6s ease 0.3s",
        }}
      />

      {/* Loading dot */}
      <div
        style={{
          position: "absolute",
          bottom: 48,

          display: "flex",
          gap: 6,

          opacity: phase === "hold" ? 1 : 0,

          transition: "opacity 0.3s ease",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",

              background: "var(--gold)",

              animation: `skeleton-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,

              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  )
}

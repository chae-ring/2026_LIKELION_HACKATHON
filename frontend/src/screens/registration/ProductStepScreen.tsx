import { useState } from "react"

import PrimaryButton from "../../components/common/PrimaryButton"

import StepIndicator from "../../components/common/StepIndicator"

import TopBar from "../../components/common/TopBar"

import { verifySerial } from "../../api/product"

import { ApiError } from "../../api/client"

import type { Product } from "../../types"

const today = () => new Date().toISOString().slice(0, 10)

export default function ProductStepScreen({
  onBack,

  onNext,
}: {
  onBack: () => void

  onNext: (product: Product, purchaseDate: string) => void
}) {
  const [serial, setSerial] = useState("")

  const [purchaseDate, setPurchaseDate] = useState("")

  const [error, setError] = useState("")

  const [confirmed, setConfirmed] = useState<Product | null>(null)

  const [touched, setTouched] = useState(false)

  const [checking, setChecking] = useState(false)


  const handleCheck = async () => {
    setTouched(true)

    const upper = serial.trim().toUpperCase()

    if (!upper) {
      setError("시리얼 넘버를 입력해 주세요.")

      return
    }

    setChecking(true)

    setError("")

    try {
      const res = await verifySerial(upper)

      if (!res.valid || !res.product) {
        setConfirmed(null)

        setError("등록할 수 없는 시리얼 번호입니다.")

        return
      }

      const product = res.product

      setConfirmed({
        id: product.id,

        name: product.name,

        model: product.model,

        color: product.color,

        category: product.category,

        serial: upper,

        imageUrl: product.imageUrl,
      })
    } catch (err) {
      setConfirmed(null)

      setError(
        err instanceof ApiError
          ? err.message
          : "시리얼 넘버 확인 중 오류가 발생했습니다.",
      )
    } finally {
      setChecking(false)
    }
  }

  const handleNext = () => {
    if (!confirmed) return

    if (!purchaseDate) {
      setError("구매일을 선택해 주세요.")

      return
    }

    setError("")

    onNext(confirmed, purchaseDate)
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
      <StepIndicator step={1} />

      <div style={{ padding: "36px 28px 0" }}>
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
          Step 1
        </p>
        <h2
          style={{
            margin: 0,

            fontFamily: "Playfair Display, serif",

            fontSize: 31,

            fontWeight: 500,

            color: "var(--brown)",

            lineHeight: 1.25,
          }}
        >
          제품을 등록해 주세요
        </h2>
        <p
          style={{
            margin: "16px 0 0",

            fontFamily: "Outfit, sans-serif",

            fontSize: 13,

            color: "var(--brown-light)",

            lineHeight: 1.6,
          }}
        >
          제품 내부 태그나 패키지에서 시리얼 넘버를 확인하세요.
        </p>
      </div>

      <div style={{ padding: "38px 28px 0" }}>
        {/* Serial input */}
        <label
          style={{
            fontFamily: "Outfit, sans-serif",

            fontSize: 11,

            color: "var(--brown)",

            letterSpacing: "0.1em",

            textTransform: "uppercase",
          }}
        >
          시리얼 넘버
        </label>
        <div style={{ marginTop: 8, position: "relative" }}>
          <input
            value={serial}
            onChange={(e) => {
              setSerial(e.target.value)

              if (touched) setError("")

              setConfirmed(null)
            }}
            placeholder="시리얼 넘버 입력"
            style={{
              width: "100%",

              padding: "15px 16px",

              fontFamily: "Outfit, sans-serif",

              fontSize: 15,

              background: "var(--warm-white)",

              border: `1px solid ${error ? "#c0392b" : "var(--border)"}`,

              borderRadius: 2,

              color: "var(--brown)",

              outline: "none",

              letterSpacing: "0.04em",
            }}
          />
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

        {/* Help tip */}
        <div
          style={{
            marginTop: 16,

            padding: "12px 14px",

            background: "var(--cream-mid)",

            borderRadius: 2,

            borderLeft: "2px solid var(--gold)",
          }}
        >
          <p
            style={{
              margin: 0,

              fontFamily: "Outfit, sans-serif",

              fontSize: 11,

              color: "var(--brown-mid)",

              lineHeight: 1.6,
            }}
          >
            시리얼 넘버는 영문과 숫자를 포함한 9–12자리입니다.
          </p>
        </div>

        {/* Confirmed product card */}
        {confirmed && (
          <div
            className="fade-up"
            style={{
              marginTop: 24,

              background: "var(--warm-white)",

              border: "1px solid var(--border)",

              borderRadius: 4,

              overflow: "hidden",
            }}
          >
            <img
              src={confirmed.imageUrl}
              alt={confirmed.name}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
            <div style={{ padding: "16px 18px" }}>
              <p
                style={{
                  margin: "0 0 2px",

                  fontFamily: "Playfair Display, serif",

                  fontSize: 16,

                  color: "var(--brown)",

                  fontWeight: 500,
                }}
              >
                {confirmed.name}
              </p>
              <p
                style={{
                  margin: "0 0 14px",

                  fontFamily: "Outfit, sans-serif",

                  fontSize: 12,

                  color: "var(--brown-light)",
                }}
              >
                {confirmed.model}
              </p>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  ["컬러", confirmed.color],

                  ["카테고리", confirmed.category],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p
                      style={{
                        margin: "0 0 2px",

                        fontFamily: "Outfit, sans-serif",

                        fontSize: 9,

                        color: "var(--gold)",

                        letterSpacing: "0.1em",

                        textTransform: "uppercase",
                      }}
                    >
                      {k}
                    </p>
                    <p
                      style={{
                        margin: 0,

                        fontFamily: "Outfit, sans-serif",

                        fontSize: 12,

                        color: "var(--brown)",
                      }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 14,

                  display: "flex",

                  alignItems: "center",

                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,

                    height: 8,

                    borderRadius: "50%",

                    background: "#27ae60",

                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",

                    fontSize: 11,

                    color: "#27ae60",
                  }}
                >
                  등록 가능한 제품입니다
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 구매일 입력 UI (PRD-002) */}
        {confirmed && (
          <div className="fade-up" style={{ marginTop: 20 }}>
            <label
              style={{
                fontFamily: "Outfit, sans-serif",

                fontSize: 11,

                color: "var(--brown)",

                letterSpacing: "0.1em",

                textTransform: "uppercase",
              }}
            >
              구매일
            </label>
            <div style={{ marginTop: 8 }}>
              <input
                type="date"
                value={purchaseDate}
                max={today()}
                onChange={(e) => {
                  setPurchaseDate(e.target.value)

                  setError("")
                }}
                style={{
                  width: "100%",

                  padding: "15px 16px",

                  fontFamily: "Outfit, sans-serif",

                  fontSize: 15,

                  background: "var(--warm-white)",

                  border: "1px solid var(--border)",

                  borderRadius: 2,

                  color: "var(--brown)",

                  outline: "none",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "24px 28px",

          marginTop: "auto",

          display: "flex",

          flexDirection: "column",

          gap: 12,
        }}
      >
        {!confirmed && (
          <PrimaryButton onClick={handleCheck} disabled={checking}>
            {checking ? "확인 중..." : "시리얼 넘버 확인"}
          </PrimaryButton>
        )}
        {confirmed && (
          <PrimaryButton onClick={handleNext}>
            다음 단계로
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

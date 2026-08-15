import { useState } from "react"
import PrimaryButton from "../../components/common/PrimaryButton"
import StepIndicator from "../../components/common/StepIndicator"
import TopBar from "../../components/common/TopBar"
import { registerProduct, verifySerial } from "../../api/product"
import { ApiError } from "../../api/client"
import type { Product } from "../../types"

const today = () => new Date().toISOString().slice(0, 10)

export default function ProductStepScreen({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (product: Product, userProductId: number) => void
}) {
  const [serial, setSerial] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState<Product | null>(null)
  const [touched, setTouched] = useState(false)
  const [checking, setChecking] = useState(false)
  const [registering, setRegistering] = useState(false)

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
      // PRD-001: 시리얼 번호 검증
      const res = await verifySerial(upper)

      if (!res.valid || !res.product) {
        setConfirmed(null)
        setError(
          "유효하지 않은 시리얼 넘버입니다. 제품 내부 태그를 확인해 주세요.",
        )
        return
      }

      setConfirmed({
        id: String(res.product.id),
        name: res.product.name,
        model: res.product.model ?? "",
        color: res.product.color,
        category: res.product.category,
        serial: upper,
        imageUrl: res.product.imageUrl,
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

  const handleNext = async () => {
    if (!confirmed) return

    if (!purchaseDate) {
      setError("구매일을 선택해 주세요.")
      return
    }

    setRegistering(true)
    setError("")

    try {
      // PRD-002: 검증한 제품을 사용자 컬렉션에 등록
      const res = await registerProduct({
        serialNumber: confirmed.serial,
        purchaseDate,
      })

      onNext(confirmed, res.userProductId)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "제품 등록 중 오류가 발생했습니다.",
      )
    } finally {
      setRegistering(false)
    }
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
          Step 1
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
          제품을
          <br />
          등록해 주세요
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: "var(--brown-light)",
            lineHeight: 1.6,
          }}
        >
          제품 내부 태그 또는 포장 박스에서
          <br />
          시리얼 넘버를 확인하세요.
        </p>
      </div>

      <div style={{ padding: "32px 24px 0" }}>
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
            placeholder="예: MCM2024001"
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
            💡 시리얼 넘버는 영문+숫자 9-12자리입니다.
            <br />
            테스트: <strong>MCM2024001</strong>, <strong>MCM2024002</strong>
          </p>
        </div>

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
          padding: "24px",
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
          <PrimaryButton onClick={handleNext} disabled={registering}>
            {registering ? "등록 중..." : "다음 단계로"}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import PrimaryButton from "../components/common/PrimaryButton"
import TopBar from "../components/common/TopBar"
import { getUserId } from "../api/auth"
import { ApiError } from "../api/client"
import { getRecommendations } from "../api/recommendation"
import type { ProductRecommendation } from "../api/types"

export default function RecommendationsScreen({
  onCollection,
  onBack,
}: {
  onCollection: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [items, setItems] = useState<ProductRecommendation[]>([])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError("")

      const userId = getUserId()

      if (userId == null) {
        if (!cancelled) {
          setError("로그인 정보가 없어 추천 상품을 불러올 수 없습니다.")
          setLoading(false)
        }
        return
      }

      try {
        const res = await getRecommendations(userId)
        if (!cancelled) setItems(res.recommendations)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "추천 상품을 불러오는 중 오류가 발생했습니다.",
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
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
          {loading
            ? "AI가 컬렉션을 분석하고 있어요…"
            : "등록하신 제품과 어울리는 상품을 AI가 선별했습니다."}
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
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 130,
                borderRadius: 4,
                background: "var(--cream-dark)",
              }}
            />
          ))}

        {!loading && error && (
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#c0392b",
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "var(--brown-light)",
            }}
          >
            아직 추천할 상품이 없습니다.
          </p>
        )}

        {!loading &&
          !error &&
          items.map((item) => (
            <div
              key={item.productId}
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
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 12,
                    padding: "8px 0",
                    display: "inline-block",
                    width: "fit-content",
                    borderBottom: "1px solid var(--brown)",
                    textAlign: "left",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 11,
                    color: "var(--brown)",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                  }}
                >
                  상품 자세히 보기 →
                </a>
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

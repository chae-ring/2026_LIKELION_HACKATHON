import { useEffect, useState } from "react"
import CertificateCard from "../../components/certificate/CertificateCard"
import PrimaryButton from "../../components/common/PrimaryButton"
import TopBar from "../../components/common/TopBar"
import { getAftercare, getCollectionDetail } from "../../api/collection"
import { toEmotionLabel } from "../../api/collection-emotion-label"
import { ApiError } from "../../api/client"
import type { AftercareResponse, CollectionDetailResponse } from "../../api/types"
import type { Certificate, Emotion } from "../../types"

const WARRANTY_STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  ACTIVE: {
    label: "보증 기간 내",
    color: "#1a6b3c",
    bg: "rgba(39,174,96,0.1)",
  },
  EXPIRING: {
    label: "만료 예정",
    color: "#8b5e00",
    bg: "rgba(241,196,15,0.12)",
  },
  EXPIRED: { label: "보증 만료", color: "#9b2929", bg: "rgba(192,57,43,0.1)" },
  UNKNOWN: {
    label: "확인 필요",
    color: "var(--brown-mid)",
    bg: "var(--cream-mid)",
  },
}

function toCertificate(detail: CollectionDetailResponse): Certificate {
  return {
    product: {
      id: detail.product.id,
      name: detail.product.name,
      model: detail.product.model ?? "",
      color: detail.product.color,
      category: detail.product.category,
      serial: detail.product.serialNumber,
      imageUrl: "",
    },
    story: detail.story.content,
    emotions: detail.story.emotions.map(toEmotionLabel) as Emotion[],
    artworkUrl: detail.artworkUrl,
    createdAt: new Date(detail.createdAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    registeredAt: new Date(detail.product.registeredAt),
  }
}

export default function CollectionDetailScreen({
  artworkId,
  userProductId,
  onBack,
  onRecommendations,
}: {
  artworkId: number
  userProductId: number
  onBack: () => void
  onRecommendations: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [detail, setDetail] = useState<CollectionDetailResponse | null>(null)
  const [aftercare, setAftercare] = useState<AftercareResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError("")

      try {
        const [detailRes, aftercareRes] = await Promise.all([
          getCollectionDetail(artworkId),
          getAftercare(userProductId),
        ])

        if (cancelled) return
        setDetail(detailRes)
        setAftercare(aftercareRes)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : "보증서 정보를 불러오는 중 오류가 발생했습니다.",
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [artworkId, userProductId])

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar onBack={onBack} label="보증서 상세" />
        <div style={{ padding: 24 }}>
          {[1, 1, 1].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 80,
                borderRadius: 4,
                background: "var(--cream-dark)",
                marginBottom: 14,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error || !detail || !aftercare) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar onBack={onBack} label="보증서 상세" />
        <div style={{ padding: 24 }}>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#c0392b",
            }}
          >
            {error || "정보를 불러오지 못했습니다."}
          </p>
        </div>
      </div>
    )
  }

  const cert = toCertificate(detail)
  const badge =
    WARRANTY_STATUS_LABEL[aftercare.warranty.status] ??
    WARRANTY_STATUS_LABEL.UNKNOWN
  const isUnknown = aftercare.warranty.status === "UNKNOWN"

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar onBack={onBack} label="보증서 상세" />

      <div style={{ overflowY: "auto", flex: 1, padding: "24px 24px 0" }}>
        <CertificateCard cert={cert} />

        {/* 제품 기본 정보 */}
        <div
          style={{
            marginTop: 20,
            background: "var(--warm-white)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
            }}
          >
            제품 정보
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 20px",
            }}
          >
            {[
              ["제품명", cert.product.name],
              ["모델", cert.product.model],
              ["컬러", cert.product.color],
              ["카테고리", cert.product.category],
              ["시리얼", cert.product.serial],
              ["등록일", cert.createdAt],
            ].map(([k, v]) => (
              <div key={k}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 9,
                    color: "var(--brown-light)",
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
        </div>

        {/* AS 기간 확인 */}
        <div
          style={{
            marginTop: 16,
            background: "var(--warm-white)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--gold)",
                textTransform: "uppercase",
              }}
            >
              AS 보증 기간
            </p>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 2,
                background: badge.bg,
                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                color: badge.color,
                fontWeight: 600,
              }}
            >
              {badge.label}
            </span>
          </div>

          {isUnknown ? (
            <div
              style={{
                padding: "14px 16px",
                background: "var(--cream-mid)",
                borderRadius: 2,
                borderLeft: "2px solid var(--brown-light)",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: "var(--brown)",
                  fontWeight: 500,
                }}
              >
                고객센터에서 확인해 주세요
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 12,
                  color: "var(--brown-light)",
                  lineHeight: 1.6,
                }}
              >
                해당 제품 카테고리의 AS 기간은
                <br />
                MCM 고객센터(1588-0000)에서 안내받으실 수 있습니다.
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    color: "var(--brown)",
                  }}
                >
                  만료 예정일
                </span>
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    color: "var(--brown)",
                    fontWeight: 600,
                  }}
                >
                  {aftercare.warranty.expiresAt
                    ? new Date(aftercare.warranty.expiresAt).toLocaleDateString(
                        "ko-KR",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "-"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                }}
              >
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    color: "var(--brown)",
                  }}
                >
                  남은 기간
                </span>
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      aftercare.warranty.status === "EXPIRING"
                        ? "#8b5e00"
                        : aftercare.warranty.status === "EXPIRED"
                          ? "#9b2929"
                          : "#1a6b3c",
                  }}
                >
                  {aftercare.warranty.status === "EXPIRED"
                    ? "보증 종료"
                    : aftercare.warranty.monthsLeft != null
                      ? `약 ${aftercare.warranty.monthsLeft}개월`
                      : "-"}
                </span>
              </div>
              {aftercare.warranty.status === "EXPIRING" && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(241,196,15,0.1)",
                    borderRadius: 2,
                    borderLeft: "2px solid #c9a227",
                    marginTop: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 12,
                      color: "#7a5500",
                      lineHeight: 1.6,
                    }}
                  >
                    보증 기간이 3개월 이내로 남았습니다.
                    <br />
                    AS가 필요하시면 만료 전에 접수하세요.
                  </p>
                </div>
              )}
              {aftercare.warranty.status === "EXPIRED" && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(192,57,43,0.07)",
                    borderRadius: 2,
                    borderLeft: "2px solid #c0392b",
                    marginTop: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 12,
                      color: "#9b2929",
                      lineHeight: 1.6,
                    }}
                  >
                    보증 기간이 종료되었습니다.
                    <br />
                    유료 수선은 MCM 고객센터(1588-0000)로 문의하세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 세탁 및 보관 방법 */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 24,
            background: "var(--warm-white)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
            }}
          >
            세탁 및 보관 방법
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aftercare.careTips.map((tip) => (
              <div
                key={tip.order}
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "var(--cream-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 9,
                    color: "var(--brown-light)",
                    marginTop: 1,
                  }}
                >
                  {tip.order}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    color: "var(--brown)",
                    lineHeight: 1.65,
                  }}
                >
                  {tip.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 24px 36px",
          borderTop: "1px solid var(--border)",
          background: "var(--cream)",
        }}
      >
        <PrimaryButton onClick={onRecommendations}>
          관련 추천 상품 보기
        </PrimaryButton>
      </div>
    </div>
  )
}

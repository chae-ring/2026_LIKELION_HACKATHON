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

export default function CollectionScreen({
  certs,

  onBack,

  onDetail,
}: {
  certs: Certificate[]

  onBack: () => void

  onDetail: (cert: Certificate) => void
}) {
  // 서버 응답을 시뮬레이션: 생성 시각 내림차순 정렬 + 600ms 로딩

  const [loading, setLoading] = useState(true)

  const [sorted, setSorted] = useState<Certificate[]>([])

  useEffect(() => {
    setLoading(true)

    const t = setTimeout(() => {
      setSorted(
        [...certs].sort(
          (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime(),
        ),
      )

      setLoading(false)
    }, 600)

    return () => clearTimeout(t)
  }, [certs])

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
      <TopBar onBack={onBack} label="My Collection" />

      <div
        style={{
          padding: "28px 24px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: "Playfair Display, serif",
              fontSize: 26,
              fontWeight: 500,
              color: "var(--brown)",
            }}
          >
            My Collection
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: "var(--brown-light)",
            }}
          >
            {loading
              ? "불러오는 중…"
              : `${sorted.length}개의 디지털 보증서 · 최신순`}
          </p>
        </div>
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div
          style={{
            padding: "8px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div
                className="skeleton"
                style={{
                  aspectRatio: "1/1",
                  borderRadius: 4,
                  background: "var(--cream-dark)",
                  marginBottom: 8,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 12,
                  borderRadius: 2,
                  background: "var(--cream-dark)",
                  width: "80%",
                  marginBottom: 5,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 10,
                  borderRadius: 2,
                  background: "var(--cream-dark)",
                  width: "55%",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && sorted.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",

              background: "var(--cream-dark)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontFamily: "Playfair Display, serif",
              fontSize: 28,
              color: "var(--brown-light)",

              marginBottom: 20,
            }}
          >
            ✦
          </div>
          <p
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 18,
              color: "var(--brown)",
              margin: "0 0 8px",
            }}
          >
            아직 등록된 제품이 없어요
          </p>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "var(--brown-light)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            첫 MCM 순간을 기록하고
            <br />
            디지털 보증서를 만들어보세요.
          </p>
        </div>
      )}

      {/* 목록 */}
      {!loading && sorted.length > 0 && (
        <div
          style={{
            padding: "0 24px 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {sorted.map((cert, i) => {
            const { status } = getWarrantyInfo(cert)

            const badge = WARRANTY_STATUS_LABEL[status]

            return (
              <div
                key={i}
                onClick={() => onDetail(cert)}
                style={{ cursor: "pointer" }}
              >
                {/* 썸네일 카드 */}
                <div
                  style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 8,
                    position: "relative",
                  }}
                >
                  <CertificateCard cert={cert} mini />
                  {/* AS 상태 뱃지 */}
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,

                      padding: "3px 7px",
                      borderRadius: 2,

                      background: badge.bg,

                      fontFamily: "Outfit, sans-serif",
                      fontSize: 9,

                      color: badge.color,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {badge.label}
                  </div>
                </div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "var(--brown)",
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {cert.product.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 10,
                    color: "var(--brown-light)",
                  }}
                >
                  {cert.createdAt}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

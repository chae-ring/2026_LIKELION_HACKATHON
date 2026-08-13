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

export default function CollectionDetailScreen({
  cert,

  onBack,

  onRecommendations,
}: {
  cert: Certificate

  onBack: () => void

  onRecommendations: () => void
}) {
  const warranty = getWarrantyInfo(cert)

  const badge = WARRANTY_STATUS_LABEL[warranty.status]

  const careTips = CARE_TIPS[cert.product.category] ?? CARE_TIPS.default

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
        {/* 보증서 카드 (플립) */}
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

              ["시리얼", `····${cert.product.serial.slice(-4)}`],

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

          {warranty.status === "unknown" ? (
            /* 확인 불가 */

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
              {/* 만료일 */}
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
                  {warranty.expiryDate!.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {/* 남은 기간 */}
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
                      warranty.status === "expiring"
                        ? "#8b5e00"
                        : warranty.status === "expired"
                          ? "#9b2929"
                          : "#1a6b3c",
                  }}
                >
                  {warranty.status === "expired"
                    ? "보증 종료"
                    : `약 ${warranty.monthsLeft}개월`}
                </span>
              </div>
              {/* 만료 임박 안내 */}
              {warranty.status === "expiring" && (
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
              {warranty.status === "expired" && (
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
            {careTips.map((tip, i) => (
              <div
                key={i}
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
                  {i + 1}
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
                  {tip}
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

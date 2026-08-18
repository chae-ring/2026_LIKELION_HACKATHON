import { useEffect, useState } from "react"
import TopBar from "../../components/common/TopBar"
import { ApiError, resolveAssetUrl } from "../../api/client"
import { getCollectionList } from "../../api/collection"
import type { CollectionListItem } from "../../api/types"

export default function CollectionScreen({
  onBack,
  onDetail,
}: {
  onBack: () => void
  onDetail: (item: { artworkId: number; userProductId: number }) => void
}) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CollectionListItem[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError("")

      try {
        const res = await getCollectionList()
        if (cancelled) return

        // 최신순 정렬
        const sorted = [...res.items].sort(
          (a, b) =>
            new Date(b.registeredAt).getTime() -
            new Date(a.registeredAt).getTime(),
        )
        setItems(sorted)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : "컬렉션을 불러오는 중 오류가 발생했습니다.",
        )
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
              : `${items.length}개의 디지털 보증서 · 최신순`}
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

      {/* 에러 */}
      {!loading && error && (
        <div style={{ padding: "24px" }}>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#c0392b",
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && !error && items.length === 0 && (
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
      {!loading && !error && items.length > 0 && (
        <div
          style={{
            padding: "0 24px 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {items.map((item) => (
            <div
              key={item.artworkId}
              onClick={() =>
                onDetail({
                  artworkId: item.artworkId,
                  userProductId: item.userProductId,
                })
              }
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  aspectRatio: "1/1",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 8,
                  background: "var(--brown)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  <img
                    src={resolveAssetUrl(
                      `/api/v1/artworks/${item.artworkId}/image`,
                    )}
                    alt={item.productName}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none"
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
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
                {item.productName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 10,
                  color: "var(--brown-light)",
                }}
              >
                {new Date(item.registeredAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

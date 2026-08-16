import PrimaryButton from "../components/common/PrimaryButton"

import SecondaryButton from "../components/common/SecondaryButton"

import VisetosPattern from "../components/decoration/VisetosPattern"

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
      <div style={{ padding: "42px 28px 0" }}>
        <p
          style={{
            fontFamily: "Playfair Display, serif",

            fontSize: 19,

            letterSpacing: "0.01em",

            color: "var(--brown)",

            margin: 0,

            fontWeight: 500,
          }}
        >
          MC<span style={{ color: "var(--gold)" }}>M</span>oments
        </p>
      </div>

      {/* Hero text */}
      <div style={{ padding: "52px 28px 28px" }}>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",

            fontSize: 34,

            fontWeight: 500,

            lineHeight: 1.25,

            color: "var(--brown)",

            margin: 0,
          }}
        >
          나의 MCM 순간을
          <br />
          기록하세요
        </h1>
        <p
          style={{
            fontFamily: "Outfit, sans-serif",

            fontSize: 14,

            lineHeight: 1.7,

            color: "var(--brown-light)",

            margin: "18px 0 0",
          }}
        >
          첫 MCM 제품과의 특별한 순간을
          <br />
          AI가 빚은 디지털 아트워크로 간직하세요.
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
            textAlign: "left",

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

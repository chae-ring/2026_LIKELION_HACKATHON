import { useState } from "react"
import type { Certificate } from "../../types"
import VisetosPattern from "../decoration/VisetosPattern"

export default function CertificateCard({
  cert,
  mini,
}: {
  cert: Certificate
  mini?: boolean
}) {
  const [flipped, setFlipped] = useState(false)

  if (mini) {
    return (
      <div
        style={{
          background: "var(--brown)",

          borderRadius: 4,
          overflow: "hidden",

          position: "relative",
          aspectRatio: "1/1",

          width: "100%",
        }}
      >
        <VisetosPattern />
        <img
          src={cert.artworkUrl}
          alt="artwork"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
            mixBlendMode: "luminosity",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,

            padding: "12px",
            background: "linear-gradient(transparent, rgba(14,8,2,0.85))",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "Playfair Display, serif",
              fontSize: 11,
              color: "var(--gold-light)",
              letterSpacing: "0.08em",
            }}
          >
            {cert.product.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flip-card"
      style={{ width: "100%", cursor: "pointer" }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`flip-card-inner${flipped ? " flipped" : ""}`}
        style={{ width: "100%" }}
      >
        {/* Front */}
        <div
          className="flip-card-front"
          style={{
            background: "var(--brown)",
            borderRadius: 6,

            overflow: "hidden",
            position: "relative",

            width: "100%",
          }}
        >
          <VisetosPattern />
          <div style={{ position: "relative", zIndex: 1, padding: 24 }}>
            {/* header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
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
                    textTransform: "uppercase",
                  }}
                >
                  MCM
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 9,
                    color: "rgba(253,250,244,0.45)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Digital Certificate
                </p>
              </div>
              <div
                style={{
                  border: "1px solid var(--gold)",
                  padding: "3px 8px",
                  borderRadius: 1,

                  fontFamily: "Outfit, sans-serif",
                  fontSize: 8,
                  color: "var(--gold)",

                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Authentic
              </div>
            </div>

            {/* artwork */}
            <div
              style={{
                aspectRatio: "1/1",
                borderRadius: 4,
                overflow: "hidden",

                marginBottom: 20,
                position: "relative",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={cert.artworkUrl}
                alt="AI generated artwork"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.75,
                  mixBlendMode: "luminosity",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,

                  background: "rgba(184,146,74,0.2)",
                  backdropFilter: "blur(4px)",

                  border: "1px solid rgba(184,146,74,0.4)",

                  borderRadius: 2,
                  padding: "4px 8px",

                  fontFamily: "Outfit, sans-serif",
                  fontSize: 8,
                  color: "var(--gold-light)",

                  letterSpacing: "0.1em",
                }}
              >
                AI Artwork
              </div>
            </div>

            {/* info */}
            <div
              style={{
                borderTop: "1px solid rgba(184,146,74,0.2)",
                paddingTop: 16,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: "Playfair Display, serif",
                  fontSize: 16,
                  color: "var(--warm-white)",
                  fontWeight: 500,
                }}
              >
                {cert.product.name}
              </p>
              <p
                style={{
                  margin: "0 0 12px",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 11,
                  color: "rgba(253,250,244,0.5)",
                  letterSpacing: "0.06em",
                }}
              >
                {cert.product.model}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
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
                    발급일
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 11,
                      color: "var(--warm-white)",
                    }}
                  >
                    {cert.createdAt}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
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
                    Serial
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "var(--warm-white)",
                      fontFamily: "monospace",
                    }}
                  >
                    {cert.product.serial}
                  </p>
                </div>
              </div>
            </div>

            {/* flip hint */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 4,

                color: "rgba(184,146,74,0.6)",

                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              탭하여 뒷면 보기
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="flip-card-back"
          style={{
            background: "var(--cream)",
            borderRadius: 6,

            border: "1px solid var(--border)",

            overflow: "hidden",
            position: "absolute",
            inset: 0,

            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Playfair Display, serif",
                  fontSize: 11,
                  color: "var(--brown)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                MCM
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 9,
                  color: "var(--brown-light)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                My Story
              </p>
            </div>
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                color: "var(--brown-light)",
                letterSpacing: "0.06em",
              }}
            >
              탭하여 앞면 보기
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                color: "var(--gold)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              구매 사연
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "Playfair Display, serif",
                fontSize: 14,

                color: "var(--brown)",
                lineHeight: 1.75,
                fontStyle: "italic",
              }}
            >
              "{cert.story}"
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "Outfit, sans-serif",
                fontSize: 10,
                color: "var(--gold)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              담긴 감정
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cert.emotions.map((e) => (
                <span
                  key={e}
                  style={{
                    padding: "5px 12px",

                    border: "1px solid var(--brown-mid)",

                    borderRadius: 40,
                    fontFamily: "Outfit, sans-serif",

                    fontSize: 12,
                    color: "var(--brown)",
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
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
                  제품명
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "var(--brown)",
                  }}
                >
                  {cert.product.name}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
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
                  컬러
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "var(--brown)",
                  }}
                >
                  {cert.product.color}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




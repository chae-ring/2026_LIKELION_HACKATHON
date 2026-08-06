import type { ReactNode } from "react"

export default function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "15px 24px",

        background: "transparent",

        color: "var(--brown)",

        fontFamily: "Outfit, sans-serif",
        fontSize: 15,
        fontWeight: 500,

        letterSpacing: "0.04em",

        border: "1px solid var(--border)",

        borderRadius: 2,

        cursor: "pointer",

        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

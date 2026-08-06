import type { ReactNode } from "react"

export default function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "17px 24px",

        background: disabled ? "var(--cream-dark)" : "var(--brown)",

        color: disabled ? "var(--brown-light)" : "var(--warm-white)",

        fontFamily: "Outfit, sans-serif",
        fontSize: 15,
        fontWeight: 600,

        letterSpacing: "0.05em",

        border: "none",
        borderRadius: 2,

        cursor: disabled ? "not-allowed" : "pointer",

        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

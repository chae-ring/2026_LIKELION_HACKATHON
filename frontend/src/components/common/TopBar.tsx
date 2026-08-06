export default function TopBar({
  onBack,
  label,
}: {
  onBack?: () => void
  label?: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",

        padding: "18px 20px 0",

        gap: 12,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",

            padding: 4,
            color: "var(--brown)",
            display: "flex",
          }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <span
        style={{
          fontFamily: "Playfair Display, serif",

          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.12em",

          color: "var(--brown)",
          opacity: 0.6,

          textTransform: "uppercase",
        }}
      >
        {label ?? "MCMoments"}
      </span>
    </div>
  )
}

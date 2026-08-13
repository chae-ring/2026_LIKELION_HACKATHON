export default function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 24px 0",
      }}
    >
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: s < 3 ? 1 : "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",

              background: s <= step ? "var(--brown)" : "var(--cream-dark)",

              color: s <= step ? "var(--warm-white)" : "var(--brown-light)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: 12,
              fontWeight: 600,
              fontFamily: "Outfit, sans-serif",

              flexShrink: 0,
              transition: "all 0.3s ease",
            }}
          >
            {s < step ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              style={{
                flex: 1,
                height: 1,

                background: s < step ? "var(--brown)" : "var(--cream-dark)",

                transition: "background 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
      <span
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 12,

          color: "var(--brown-light)",
          letterSpacing: "0.04em",

          marginLeft: 8,
        }}
      >
        {step}/3
      </span>
    </div>
  )
}

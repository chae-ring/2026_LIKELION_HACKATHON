export const WARRANTY_MONTHS: Record<string, number | null> = {
  Backpack: 24,

  "Shoulder Bag": 24,

  Tote: 24,

  "Crossbody Bag": 24,

  Wallet: 12,
}

export const CARE_TIPS: Record<string, string[]> = {
  default: [
    "마른 부드러운 천으로 표면을 가볍게 닦아주세요.",

    "직사광선과 열원을 피해 서늘하고 통풍이 잘 되는 곳에 보관하세요.",

    "보관 시 방습제를 함께 넣고 먼지 커버를 씌워주세요.",

    "날카로운 물건과 함께 보관하지 마세요.",

    "물이 닿았다면 부드러운 천으로 즉시 닦은 뒤 자연 건조하세요.",
  ],

  Wallet: [
    "카드와 현금은 적정량만 수납하여 형태를 유지하세요.",

    "마른 부드러운 천으로 표면을 가볍게 닦아주세요.",

    "직사광선과 열원을 피해 서늘하고 통풍이 잘 되는 곳에 보관하세요.",

    "보관 시 방습제를 함께 넣어주세요.",
  ],
}

export const WARRANTY_STATUS_LABEL: Record<string, {
  label: string
  color: string
  bg: string
}> = {
  active: {
    label: "보증 기간 내",
    color: "#1a6b3c",
    bg: "rgba(39,174,96,0.1)",
  },

  expiring: {
    label: "만료 예정",
    color: "#8b5e00",
    bg: "rgba(241,196,15,0.12)",
  },

  expired: { label: "보증 만료", color: "#9b2929", bg: "rgba(192,57,43,0.1)" },

  unknown: {
    label: "확인 필요",
    color: "var(--brown-mid)",
    bg: "var(--cream-mid)",
  },
}

// ─── 6. My Collection ────────────────────────────────────────────────────────

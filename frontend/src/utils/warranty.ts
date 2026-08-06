import { WARRANTY_MONTHS } from "../constants/warranty"
import type { Certificate } from "../types"

export function getWarrantyInfo(
  cert: Certificate,
): {
  status: "active" | "expiring" | "expired" | "unknown"

  expiryDate: Date | null

  monthsLeft: number | null
} {
  const months = WARRANTY_MONTHS[cert.product.category] ?? null

  if (months === null)
    return { status: "unknown", expiryDate: null, monthsLeft: null }

  const expiry = new Date(cert.registeredAt)

  expiry.setMonth(expiry.getMonth() + months)

  const now = new Date()

  const msLeft = expiry.getTime() - now.getTime()

  const monthsLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24 * 30))

  if (msLeft <= 0)
    return { status: "expired", expiryDate: expiry, monthsLeft: 0 }

  if (monthsLeft <= 3)
    return { status: "expiring", expiryDate: expiry, monthsLeft }

  return { status: "active", expiryDate: expiry, monthsLeft }
}

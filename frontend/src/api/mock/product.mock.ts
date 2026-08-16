import { VALID_SERIALS } from "../../constants/products"

import { ApiError } from "../client"

import { wait } from "../client"

import type {
  RegisterProductRequest,
  RegisterProductResponse,
  VerifySerialResponse,
} from "../types"

export async function mockVerifySerial(
  serial: string,
): Promise<VerifySerialResponse> {
  await wait(800)

  const upper = serial.trim().toUpperCase()
  const found = VALID_SERIALS[upper]

  if (!found || upper === "MCM9999") {
    return { valid: false, product: null }
  }

  return {
    valid: true,
    product: {
      id: found.id,
      name: found.name,
      model: found.model,
      color: found.color,
      category: found.category,
      imageUrl: found.imageUrl,
    },
  }
}

export async function mockRegisterProduct(
  req: RegisterProductRequest,
): Promise<RegisterProductResponse> {
  await wait(500)

  const product = VALID_SERIALS[req.serialNumber]
  if (!product) {
    throw new ApiError("유효하지 않은 시리얼 넘버입니다.", "INVALID_SERIAL")
  }

  const registeredAt = new Date().toISOString()
  return {
    userProductId: Date.now(),
    product: {
      id: product.id,
      name: product.name,
      color: product.color,
      category: product.category,
    },
    purchaseDate: req.purchaseDate,
    warrantyExpiresAt: null,
    registeredAt,
  }
}

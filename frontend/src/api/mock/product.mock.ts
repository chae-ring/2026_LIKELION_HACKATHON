import { VALID_SERIALS } from "../../constants/products"
import { wait } from "../client"
import type {
  RegisterProductRequest,
  RegisterProductResponse,
  VerifySerialResponse,
} from "../types"

let mockUserProductSeq = 1

export async function mockVerifySerial(
  serialNumber: string,
): Promise<VerifySerialResponse> {
  await wait(800)

  const upper = serialNumber.trim().toUpperCase()
  const found = VALID_SERIALS[upper]

  if (!found) {
    return { valid: false, product: null }
  }

  return {
    valid: true,
    product: {
      id: Number(found.id) || 1,
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

  const upper = req.serialNumber.trim().toUpperCase()
  const found = VALID_SERIALS[upper]

  const purchase = new Date(req.purchaseDate)
  const expires = new Date(purchase)
  expires.setFullYear(expires.getFullYear() + 2)

  return {
    userProductId: mockUserProductSeq++,
    product: {
      id: Number(found?.id) || 1,
      name: found?.name ?? "MCM Product",
      color: found?.color ?? "",
      category: found?.category ?? "",
    },
    purchaseDate: req.purchaseDate,
    warrantyExpiresAt: expires.toISOString().slice(0, 10),
    registeredAt: new Date().toISOString(),
  }
}

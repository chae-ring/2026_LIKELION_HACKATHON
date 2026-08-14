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

  if (upper === "MCM9999") {
    throw new ApiError("이미 등록된 시리얼 넘버입니다.", "ALREADY_REGISTERED")
  }

  const found = VALID_SERIALS[upper]

  if (!found) {
    throw new ApiError(
      "유효하지 않은 시리얼 넘버입니다. 제품 내부 태그를 확인해 주세요.",
      "INVALID_SERIAL",
    )
  }

  return {
    productId: found.id,
    name: found.name,
    model: found.model,
    color: found.color,
    category: found.category,
    imageUrl: found.imageUrl,
  }
}

export async function mockRegisterProduct(
  req: RegisterProductRequest,
): Promise<RegisterProductResponse> {
  await wait(500)

  return { registrationId: `REG-${req.productId}-${Date.now()}` }
}

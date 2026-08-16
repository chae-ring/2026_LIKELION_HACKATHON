import { apiRequest } from "./client"

import { USE_MOCK } from "./config"

import { mockRegisterProduct, mockVerifySerial } from "./mock/product.mock"

import type {
  RegisterProductRequest,
  RegisterProductResponse,
  VerifySerialResponse,
} from "./types"

export async function verifySerial(
  serial: string,
): Promise<VerifySerialResponse> {
  if (USE_MOCK) return mockVerifySerial(serial)

  return apiRequest<VerifySerialResponse>("/api/v1/products/serial/verify", {
    method: "POST",

    body: { serialNumber: serial },
  })
}

export async function registerProduct(
  req: RegisterProductRequest,
): Promise<RegisterProductResponse> {
  if (USE_MOCK) return mockRegisterProduct(req)

  return apiRequest<RegisterProductResponse>("/api/v1/user-products", {
    method: "POST",

    body: req,
  })
}

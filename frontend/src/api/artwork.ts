import { ApiError, apiRequest, resolveAssetUrl, wait } from "./client"
import { USE_MOCK } from "./config"
import {
  mockGetArtworkStatus,
  mockRequestArtwork,
} from "./mock/artwork.mock"
import type { ArtworkStatusResponse, RequestArtworkResponse } from "./types"

// ART-001: 구매 사연과 제품 정보를 기반으로 AI 아트워크 생성 요청
export async function requestArtwork(
  userProductId: number,
): Promise<RequestArtworkResponse> {
  if (USE_MOCK) return mockRequestArtwork(userProductId)

  return apiRequest<RequestArtworkResponse>(
    `/api/v1/user-products/${userProductId}/artworks`,
    { method: "POST" },
  )
}

// ART-002: 아트워크 생성 상태 및 결과 조회
export async function getArtworkStatus(
  artworkId: number,
): Promise<ArtworkStatusResponse> {
  if (USE_MOCK) return mockGetArtworkStatus(artworkId)

  const res = await apiRequest<ArtworkStatusResponse>(
    `/api/v1/artworks/${artworkId}`,
  )

  // 백엔드는 완료 시 "/api/v1/artworks/5/image" 같은 상대경로를 주기 때문에
  // <img src>에 바로 쓸 수 있게 서버 주소를 붙여줌.
  return { ...res, artworkUrl: resolveAssetUrl(res.artworkUrl) }
}

interface PollOptions {
  intervalMs?: number
  timeoutMs?: number
  signal?: { cancelled: boolean }
}

// COMPLETED 또는 FAILED가 나올 때까지 반복 조회.
// 30초 안에 안 끝나면 TIMEOUT 에러 (기획서 리스크 대응: 30초 타임아웃).
export async function pollArtworkStatus(
  artworkId: number,
  { intervalMs = 1500, timeoutMs = 30000, signal }: PollOptions = {},
): Promise<ArtworkStatusResponse> {
  const startedAt = Date.now()

  while (true) {
    if (signal?.cancelled) {
      throw new ApiError("작업이 취소되었습니다.", "CANCELLED")
    }

    const res = await getArtworkStatus(artworkId)

    if (res.status === "COMPLETED" || res.status === "FAILED") {
      return res
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new ApiError(
        "아트워크 생성이 30초 내에 완료되지 않았습니다.",
        "TIMEOUT",
      )
    }

    await wait(intervalMs)
  }
}

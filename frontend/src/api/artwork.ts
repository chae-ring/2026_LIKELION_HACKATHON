import { ApiError, apiRequest, resolveAssetUrl, wait } from "./client"
import { USE_MOCK } from "./config"
import {
  mockGetArtworkStatus,
  mockRequestArtwork,
} from "./mock/artwork.mock"
import type {
  ArtworkStatusResponse,
  RequestArtworkResponse,
} from "./types"

// ART-001: 구매 사연과 제품 정보를 기반으로 AI 아트워크 생성 요청
export async function requestArtwork(
  productId: number,
  storyContent: string,
): Promise<RequestArtworkResponse> {
  if (USE_MOCK) return mockRequestArtwork(productId)

  return apiRequest<RequestArtworkResponse>(
    `/api/v1/products/${productId}/artworks`,
    { method: "POST", body: { storyContent } },
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

  return { ...res, artworkUrl: resolveAssetUrl(res.artworkUrl) }
}

interface PollOptions {
  intervalMs?: number
  signal?: { cancelled: boolean }
  onTick?: (elapsedMs: number) => void
}

// COMPLETED 또는 FAILED가 나올 때까지 계속 반복 조회.
// 백엔드는 @Async로 별도 스레드에서 계속 작업하기 때문에, 프론트가
// 특정 시간에 임의로 포기하면 실제로는 진행 중인 작업을 실패로
// 잘못 처리하게 됨. 그래서 강제 타임아웃 없이 끝까지 기다리고,
// 대신 signal.cancelled로 사용자가 직접 중단(대체 아트워크 등)할 수 있게 함.
export async function pollArtworkStatus(
  artworkId: number,
  { intervalMs = 1500, signal, onTick }: PollOptions = {},
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

    onTick?.(Date.now() - startedAt)

    await wait(intervalMs)
  }
}
import { ApiError, apiRequest, wait } from "./client"
import { USE_MOCK } from "./config"
import {
  mockGetArtworkStatus,
  mockRequestArtwork,
} from "./mock/artwork.mock"
import type {
  ArtworkStatusResponse,
  RequestArtworkRequest,
  RequestArtworkResponse,
} from "./types"

export async function requestArtwork(
  req: RequestArtworkRequest,
): Promise<RequestArtworkResponse> {
  if (USE_MOCK) return mockRequestArtwork(req)

  return apiRequest<RequestArtworkResponse>("/artworks", {
    method: "POST",
    body: req,
  })
}

export async function getArtworkStatus(
  jobId: string,
): Promise<ArtworkStatusResponse> {
  if (USE_MOCK) return mockGetArtworkStatus(jobId)

  return apiRequest<ArtworkStatusResponse>(`/artworks/${jobId}`)
}

interface PollOptions {
  intervalMs?: number
  timeoutMs?: number
  signal?: { cancelled: boolean }
}

// 완료(success) 또는 실패(failed) 상태가 나올 때까지 반복 조회.
// 30초 안에 안 끝나면 TIMEOUT 에러를 던짐 (ART-002 요구사항).
export async function pollArtworkStatus(
  jobId: string,
  { intervalMs = 1500, timeoutMs = 30000, signal }: PollOptions = {},
): Promise<ArtworkStatusResponse> {
  const startedAt = Date.now()

  while (true) {
    if (signal?.cancelled) {
      throw new ApiError("작업이 취소되었습니다.", "CANCELLED")
    }

    const res = await getArtworkStatus(jobId)

    if (res.status === "success" || res.status === "failed") {
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

import { ARTWORK_URLS } from "../../constants/artworks"
import { ApiError, wait } from "../client"
import type { ArtworkStatusResponse, RequestArtworkResponse } from "../types"

let mockArtworkSeq = 1

const jobStore = new Map<
  number,
  { productId: number; startedAt: number; willSucceed: boolean }
>()

export async function mockRequestArtwork(
  productId: number,
): Promise<RequestArtworkResponse> {
  await wait(400)

  const artworkId = mockArtworkSeq++

  jobStore.set(artworkId, {
    productId,
    startedAt: Date.now(),
    willSucceed: Math.random() < 0.9, // 명세서 지표: 생성 성공률 90% 이상
  })

  return {
    artworkId,
    productId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  }
}

export async function mockGetArtworkStatus(
  artworkId: number,
): Promise<ArtworkStatusResponse> {
  await wait(400)

  const job = jobStore.get(artworkId)

  if (!job) {
    throw new ApiError("존재하지 않는 아트워크입니다.", "NOT_FOUND", 404)
  }

  const elapsed = Date.now() - job.startedAt
  const base = {
    artworkId,
    productId: job.productId,
    createdAt: new Date(job.startedAt).toISOString(),
  }

  if (elapsed < 2800) {
    return { ...base, status: "PENDING" }
  }

  if (job.willSucceed) {
    const artworkUrl =
      ARTWORK_URLS[Math.floor(Math.random() * ARTWORK_URLS.length)]
    return { ...base, status: "COMPLETED", artworkUrl }
  }

  return { ...base, status: "FAILED" }
}

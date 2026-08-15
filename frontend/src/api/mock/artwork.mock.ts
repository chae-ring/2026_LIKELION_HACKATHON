import { ARTWORK_URLS } from "../../constants/artworks"
import { ApiError, wait } from "../client"
import type {
  ArtworkStatusResponse,
  RequestArtworkRequest,
  RequestArtworkResponse,
} from "../types"

// 실제 서버라면 DB에 저장할 job 상태를, 여기서는 메모리에만 잠깐 들고 있음
const jobStore = new Map<string, { startedAt: number; willSucceed: boolean }>()

export async function mockRequestArtwork(
  req: RequestArtworkRequest,
): Promise<RequestArtworkResponse> {
  await wait(400)

  const jobId = `JOB-${req.registrationId}-${Date.now()}`

  jobStore.set(jobId, {
    startedAt: Date.now(),
    willSucceed: Math.random() < 0.9, // 원본 프로토타입과 동일하게 90% 성공률
  })

  return { jobId }
}

export async function mockGetArtworkStatus(
  jobId: string,
): Promise<ArtworkStatusResponse> {
  await wait(400)

  const job = jobStore.get(jobId)

  if (!job) {
    throw new ApiError("존재하지 않는 작업입니다.", "JOB_NOT_FOUND")
  }

  const elapsed = Date.now() - job.startedAt

  if (elapsed < 1200) return { status: "pending" }
  if (elapsed < 2800) return { status: "processing" }

  if (job.willSucceed) {
    const artworkUrl =
      ARTWORK_URLS[Math.floor(Math.random() * ARTWORK_URLS.length)]
    return { status: "success", artworkUrl }
  }

  return {
    status: "failed",
    errorMessage: "AI 생성 중 오류가 발생했습니다.",
  }
}

import { apiRequest } from "./client"
import { USE_MOCK } from "./config"
import { mockGetRecommendations } from "./mock/recommendation.mock"
import type { RecommendationListResponse } from "./types"

// REC-001: 등록 제품 기반 추천 상품 조회 및 AI 추천 이유 생성
// userId는 로그인 시 저장해둔 값을 사용 (userProductId 아님, 주의)
export async function getRecommendations(
  userId: number,
): Promise<RecommendationListResponse> {
  if (USE_MOCK) return mockGetRecommendations(userId)

  return apiRequest<RecommendationListResponse>(
    `/api/v1/users/${userId}/recommendations`,
  )
}

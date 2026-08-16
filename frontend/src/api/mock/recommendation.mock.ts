import { RECOMMENDED } from "../../constants/recommendations"
import { wait } from "../client"
import type { RecommendationListResponse } from "../types"

export async function mockGetRecommendations(
  _userId: number,
): Promise<RecommendationListResponse> {
  await wait(500)

  return {
    recommendations: RECOMMENDED.map((item, i) => ({
      productId: i + 1,
      name: item.name,
      category: item.category,
      season: item.season,
      imageUrl: item.imageUrl,
      reason: item.reason,
      productUrl: "https://example.com",
    })),
  }
}

import { apiRequest } from "./client"
import { USE_MOCK } from "./config"
import { mockSubmitStory } from "./mock/story.mock"
import type { SubmitStoryRequest, SubmitStoryResponse } from "./types"

export async function submitStory(
  userProductId: number,
  req: SubmitStoryRequest,
): Promise<SubmitStoryResponse> {
  if (USE_MOCK) return mockSubmitStory(userProductId, req)

  return apiRequest<SubmitStoryResponse>(
    `/api/v1/user-products/${userProductId}/story`,
    {
      method: "POST",
      body: req,
    },
  )
}

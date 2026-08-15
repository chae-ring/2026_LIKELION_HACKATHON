import { apiRequest } from "./client"
import { USE_MOCK } from "./config"
import { mockSubmitStory } from "./mock/story.mock"
import type { SubmitStoryRequest, SubmitStoryResponse } from "./types"

export async function submitStory(
  req: SubmitStoryRequest,
): Promise<SubmitStoryResponse> {
  if (USE_MOCK) return mockSubmitStory(req)

  return apiRequest<SubmitStoryResponse>("/stories", {
    method: "POST",
    body: req,
  })
}

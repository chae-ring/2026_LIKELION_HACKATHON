import { wait } from "../client"
import type { SubmitStoryRequest, SubmitStoryResponse } from "../types"

export async function mockSubmitStory(
  userProductId: number,
  req: SubmitStoryRequest,
): Promise<SubmitStoryResponse> {
  await wait(500)
  return {
    storyId: Date.now(),
    userProductId,
    content: req.content,
    emotions: req.emotions,
    createdAt: new Date().toISOString(),
  }
}

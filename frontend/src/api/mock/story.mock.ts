import { wait } from "../client"
import type { SubmitStoryRequest, SubmitStoryResponse } from "../types"

export async function mockSubmitStory(
  req: SubmitStoryRequest,
): Promise<SubmitStoryResponse> {
  await wait(500)

  return { storyId: `STORY-${req.registrationId}-${Date.now()}` }
}

import { apiRequest, resolveAssetUrl } from "./client"
import { USE_MOCK } from "./config"
import {
  mockGetAftercare,
  mockGetCollectionDetail,
  mockGetCollectionList,
} from "./mock/collection.mock"
import type {
  AftercareResponse,
  CollectionDetailResponse,
  CollectionListResponse,
} from "./types"

// COL-001: 로그인 사용자의 My Collection 목록 조회
export async function getCollectionList(): Promise<CollectionListResponse> {
  if (USE_MOCK) return mockGetCollectionList()

  return apiRequest<CollectionListResponse>("/api/v1/collections")
}

// COL-002: 디지털 보증서 상세 조회
export async function getCollectionDetail(
  artworkId: number,
): Promise<CollectionDetailResponse> {
  if (USE_MOCK) return mockGetCollectionDetail(artworkId)

  const res = await apiRequest<CollectionDetailResponse>(
    `/api/v1/collections/${artworkId}`,
  )

  return { ...res, artworkUrl: resolveAssetUrl(res.artworkUrl) }
}

// COL-003: 등록 제품의 AS 상태 및 관리 방법 조회
export async function getAftercare(
  userProductId: number,
): Promise<AftercareResponse> {
  if (USE_MOCK) return mockGetAftercare(userProductId)

  return apiRequest<AftercareResponse>(
    `/api/v1/user-products/${userProductId}/aftercare`,
  )
}

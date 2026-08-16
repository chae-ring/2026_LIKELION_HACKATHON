import type { Emotion } from "../types"

// ─── PRD-001: 시리얼 번호 검증 (효빈님 담당, 옛날 타입 그대로 유지) ────────

export interface VerifySerialResponse {
  productId: string
  name: string
  model: string
  color: string
  category: string
  imageUrl: string
}

// ─── PRD-002: 사용자 제품 등록 (효빈님 담당) ────────────────────────────

export interface RegisterProductRequest {
  productId: string
  serial: string
  purchaseDate: string
}

export interface RegisterProductResponse {
  registrationId: string
}

// ─── STORY-001: 구매 사연/감정 등록 (효빈님 담당) ────────────────────────

export interface SubmitStoryRequest {
  registrationId: string
  story: string
  emotions: Emotion[]
}

export interface SubmitStoryResponse {
  storyId: string
}

// ─── ART-001 / ART-002: 아트워크 생성 및 상태 조회 ─────────────────────────

export type ArtworkStatus = "PENDING" | "COMPLETED" | "FAILED"

export interface RequestArtworkResponse {
  artworkId: number
  userProductId: number
  status: ArtworkStatus
  createdAt: string
}

export interface ArtworkStatusResponse {
  artworkId: number
  userProductId: number
  status: ArtworkStatus
  artworkUrl?: string
  createdAt: string
}

// ─── COL-001: My Collection 목록 ───────────────────────────────────────────

export interface CollectionListItem {
  artworkId: number
  userProductId: number
  productName: string
  registeredAt: string
}

export interface CollectionListResponse {
  items: CollectionListItem[]
}

// ─── COL-002: 디지털 보증서 상세 ───────────────────────────────────────────

export interface CollectionDetailResponse {
  artworkId: number
  artworkUrl: string
  product: {
    id: number
    name: string
    model: string | null
    color: string
    category: string
    serialNumber: string
    purchaseDate: string
    registeredAt: string
  }
  story: {
    content: string
    emotions: string[]
  }
  createdAt: string
}

// ─── COL-003: AS 상태 및 관리 방법 ─────────────────────────────────────────

export type WarrantyStatusCode = "ACTIVE" | "EXPIRING" | "EXPIRED" | "UNKNOWN"

export interface AftercareResponse {
  warranty: {
    status: WarrantyStatusCode
    purchaseDate: string
    expiresAt: string | null
    monthsLeft: number | null
  }
  careTips: { order: number; content: string }[]
}

// ─── REC-001: 등록 제품 기반 추천 상품 조회 ────────────────────────────────

export interface ProductRecommendation {
  productId: number
  name: string
  category: string
  season: string
  imageUrl: string
  reason: string
  productUrl: string
}

export interface RecommendationListResponse {
  recommendations: ProductRecommendation[]
}
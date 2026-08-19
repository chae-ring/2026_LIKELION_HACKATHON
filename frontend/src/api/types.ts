// ─── PRD-001: 시리얼 번호 검증 ───────────────────────────────────────

export interface VerifySerialResponse {
  valid: boolean

  product: {
    id: number

    name: string

    model: string | null

    color: string

    category: string

    imageUrl: string
  } | null
}

// ─── PRD-002: 사용자 제품 등록 ───────────────────────────────────────

export interface RegisterProductRequest {
  serialNumber: string

  purchaseDate: string

  artworkId: number

  storyContent: string

  emotions: StoryEmotionCode[]
}

export interface RegisterProductResponse {
  userProductId: number

  product: {
    id: number

    name: string

    color: string

    category: string
  }

  purchaseDate: string

  warrantyExpiresAt: string | null

  registeredAt: string
}

// ─── STORY-001: 구매 사연/감정 등록 ──────────────────────────────────

export type StoryEmotionCode =
  | "JOY"
  | "PRIDE"
  | "EXCITEMENT"
  | "GRATITUDE"
  | "HAPPINESS"
  | "SATISFACTION"
  | "LOVE"
  | "AFFECTION"
  | "NOSTALGIA"
  | "COMFORT"
  | "CONFIDENCE"
  | "ACHIEVEMENT"
  | "RELIEF"
  | "SURPRISE"
  | "ANTICIPATION"
  | "SENTIMENTAL"
export interface SubmitStoryRequest {
  content: string

  emotions: StoryEmotionCode[]
}

export interface SubmitStoryResponse {
  storyId: number

  userProductId: number

  content: string

  emotions: StoryEmotionCode[]

  createdAt: string
}

// ─── ART-001 / ART-002: 아트워크 생성 및 상태 조회 ─────────────────────────

export type ArtworkStatus = "PENDING" | "COMPLETED" | "FAILED"

export interface RequestArtworkResponse {
  artworkId: number

  productId: number

  status: ArtworkStatus

  createdAt: string
}

export interface ArtworkStatusResponse {
  artworkId: number

  productId: number

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

  careTips: {
    order: number
    content: string
  }[]
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

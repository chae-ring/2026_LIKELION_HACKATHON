import type { Emotion } from "../types"

// ─── 시리얼 검증 (PRD-001) ────────────────────────────────────────────────

export interface VerifySerialResponse {
  productId: string
  name: string
  model: string
  color: string
  category: string
  imageUrl: string
}

// ─── 제품 등록 (PRD-002) ─────────────────────────────────────────────────

export interface RegisterProductRequest {
  productId: string
  serial: string
  purchaseDate: string // YYYY-MM-DD
}

export interface RegisterProductResponse {
  registrationId: string
}

// ─── 구매 사연/감정 등록 (STORY-001) ──────────────────────────────────────

export interface SubmitStoryRequest {
  registrationId: string
  story: string
  emotions: Emotion[]
}

export interface SubmitStoryResponse {
  storyId: string
}

// ─── 아트워크 생성 (ART-001, ART-002) ─────────────────────────────────────

export interface RequestArtworkRequest {
  registrationId: string
}

export interface RequestArtworkResponse {
  jobId: string
}

export type ArtworkStatus = "pending" | "processing" | "success" | "failed"

export interface ArtworkStatusResponse {
  status: ArtworkStatus
  artworkUrl?: string
  errorMessage?: string
}

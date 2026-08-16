export type Screen = "home" | "step1" | "step2" | "step3" | "recommendations" | "collection" | "collection-detail"

export type Emotion = "기쁨" | "자부심" | "설렘" | "감사"

export interface Product {
  id: number

  name: string

  model: string | null

  color: string

  category: string

  serial: string

  imageUrl: string
}

export interface Certificate {
  product: Product

  story: string

  emotions: Emotion[]

  artworkUrl: string

  createdAt: string

  registeredAt: Date
}

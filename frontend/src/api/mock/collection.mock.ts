import { ARTWORK_URLS } from "../../constants/artworks"
import { CARE_TIPS, WARRANTY_MONTHS } from "../../constants/warranty"
import { ApiError, wait } from "../client"
import type {
  AftercareResponse,
  CollectionDetailResponse,
  CollectionListResponse,
} from "../types"

// 데모용 메모리 저장소 (실제로는 백엔드 DB가 이 역할을 함)
interface MockEntry {
  artworkId: number
  userProductId: number
  productName: string
  productModel: string | null
  productColor: string
  productCategory: string
  serialNumber: string
  purchaseDate: string
  registeredAt: string
  artworkUrl: string
  storyContent: string
  storyEmotions: CollectionDetailResponse["story"]["emotions"]
}

const mockEntries: MockEntry[] = [
  {
    artworkId: 1,
    userProductId: 1,
    productName: "Stark Backpack",
    productModel: "Visetos",
    productColor: "Cognac",
    productCategory: "Backpack",
    serialNumber: "MCM2024001",
    purchaseDate: "2026-08-01",
    registeredAt: new Date().toISOString(),
    artworkUrl: ARTWORK_URLS[0],
    storyContent: "첫 취업 후 받은 첫 월급으로 나에게 선물한 가방입니다.",
    storyEmotions: ["PRIDE", "JOY"],
  },
]

export async function mockGetCollectionList(): Promise<CollectionListResponse> {
  await wait(500)

  return {
    items: mockEntries.map((e) => ({
      artworkId: e.artworkId,
      userProductId: e.userProductId,
      productName: e.productName,
      registeredAt: e.registeredAt,
    })),
  }
}

export async function mockGetCollectionDetail(
  artworkId: number,
): Promise<CollectionDetailResponse> {
  await wait(500)

  const e = mockEntries.find((x) => x.artworkId === artworkId)
  if (!e) throw new ApiError("존재하지 않는 보증서입니다.", "NOT_FOUND", 404)

  return {
    artworkId: e.artworkId,
    artworkUrl: e.artworkUrl,
    product: {
      id: e.userProductId,
      name: e.productName,
      model: e.productModel,
      color: e.productColor,
      category: e.productCategory,
      serialNumber: e.serialNumber,
      purchaseDate: e.purchaseDate,
      registeredAt: e.registeredAt,
    },
    story: {
      content: e.storyContent,
      emotions: e.storyEmotions,
    },
    createdAt: e.registeredAt,
  }
}

export async function mockGetAftercare(
  userProductId: number,
): Promise<AftercareResponse> {
  await wait(400)

  const e = mockEntries.find((x) => x.userProductId === userProductId)
  if (!e) throw new ApiError("존재하지 않는 제품입니다.", "NOT_FOUND", 404)

  const months = WARRANTY_MONTHS[e.productCategory] ?? null
  const purchase = new Date(e.purchaseDate)

  if (months == null) {
    return {
      warranty: {
        status: "UNKNOWN",
        purchaseDate: e.purchaseDate,
        expiresAt: "",
        monthsLeft: 0,
      },
      careTips: (CARE_TIPS[e.productCategory] ?? CARE_TIPS.default).map(
        (content, i) => ({ order: i + 1, content }),
      ),
    }
  }

  const expires = new Date(purchase)
  expires.setMonth(expires.getMonth() + months)

  const now = new Date()
  const monthsLeft = Math.max(
    0,
    Math.round((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)),
  )

  const status =
    expires < now ? "EXPIRED" : monthsLeft <= 3 ? "EXPIRING" : "ACTIVE"

  return {
    warranty: {
      status,
      purchaseDate: e.purchaseDate,
      expiresAt: expires.toISOString().slice(0, 10),
      monthsLeft,
    },
    careTips: (CARE_TIPS[e.productCategory] ?? CARE_TIPS.default).map(
      (content, i) => ({ order: i + 1, content }),
    ),
  }
}

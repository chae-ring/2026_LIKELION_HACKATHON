import type { Product } from "../types"

export const VALID_SERIALS: Record<string, Product> = {
  MCM2024001: {
    id: "p1",

    name: "Stark Backpack Medium",

    model: "MUK Visetos Original",

    color: "Cognac",

    category: "Backpack",

    serial: "MCM2024001",

    imageUrl:
      "https://images.unsplash.com/photo-1637759292654-a12cb2be085e?w=400&h=400&fit=crop&auto=format",
  },

  MCM2024002: {
    id: "p2",

    name: "Milano Shoulder Bag",

    model: "MWS Visetos Original",

    color: "Black",

    category: "Shoulder Bag",

    serial: "MCM2024002",

    imageUrl:
      "https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=400&h=400&fit=crop&auto=format",
  },

  MCM2024003: {
    id: "p3",

    name: "Patricia Tote Large",

    model: "MWT Visetos Original",

    color: "Loden",

    category: "Tote",

    serial: "MCM2024003",

    imageUrl:
      "https://images.unsplash.com/photo-1575403538007-acb790100421?w=400&h=400&fit=crop&auto=format",
  },
}

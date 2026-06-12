import type { WardrobeShape, WardrobeStatus, WardrobeTone } from "@prisma/client"

const statuses = ["READY", "REVIEW", "UNDERUSED", "FAVORITE"] as const
const tones = ["SAND", "SAGE", "BERRY", "INK", "CREAM", "STONE"] as const
const shapes = ["JACKET", "TOP", "DRESS", "TROUSER", "SKIRT", "SHOE", "BAG"] as const

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function stringField(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback
}

function numberField(value: unknown, fallback = 0) {
  const next = typeof value === "number" ? value : Number(value)
  return Number.isFinite(next) ? next : fallback
}

function enumField<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]) {
  const next = stringField(value).toUpperCase().replaceAll("-", "_")
  return allowed.includes(next as T[number]) ? (next as T[number]) : fallback
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export function parseWardrobeItemInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, message: "Request body must be JSON." }
  }

  const input = body as Record<string, unknown>
  const name = stringField(input.name)
  const type = stringField(input.type)
  const color = stringField(input.color)

  if (!name || !type || !color) {
    return { ok: false as const, message: "Name, type, and color are required." }
  }

  const slug = slugify(stringField(input.slug) || name)

  return {
    ok: true as const,
    data: {
      slug,
      name,
      type,
      subcategory: stringField(input.subcategory, type),
      color,
      season: stringField(input.season, "All season"),
      occasion: stringField(input.occasion, "Everyday"),
      brand: stringField(input.brand, "Unspecified"),
      notes: stringField(input.notes, "Added from Digital Wardrobe."),
      imageUrl: stringField(input.imageUrl) || null,
      wears: numberField(input.wears, 0),
      lastWorn: stringField(input.lastWorn, "Not worn yet"),
      status: enumField(input.status, statuses, "READY") as WardrobeStatus,
      tone: enumField(input.tone, tones, "STONE") as WardrobeTone,
      shape: enumField(input.shape, shapes, "TOP") as WardrobeShape,
    },
  }
}

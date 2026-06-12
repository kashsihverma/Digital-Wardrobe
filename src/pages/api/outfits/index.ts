import type { APIRoute } from "astro"
import type { OutfitStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { badRequest, json, requireDatabaseUser } from "@/lib/server/api"
import { parseJsonBody, slugify } from "@/lib/server/wardrobeInput"

const statuses = ["PLANNED", "DRAFT", "WORN"] as const

export const GET: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const outfits = await prisma.outfit.findMany({
    where: { userId: result.user.id },
    include: { items: { include: { item: true }, orderBy: { position: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })

  return json({ outfits })
}

export const POST: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const body = await parseJsonBody(request)
  if (!body || typeof body !== "object") return badRequest("Request body must be JSON.")

  const input = body as Record<string, unknown>
  const name = typeof input.name === "string" ? input.name.trim() : ""
  const itemIds = Array.isArray(input.itemIds) ? input.itemIds.filter((id): id is string => typeof id === "string") : []

  if (!name || itemIds.length === 0) {
    return badRequest("Outfit name and at least one wardrobe item are required.")
  }

  const ownedItems = await prisma.wardrobeItem.findMany({
    where: {
      id: { in: itemIds },
      userId: result.user.id,
    },
    select: { id: true },
  })

  if (ownedItems.length !== itemIds.length) {
    return badRequest("Every outfit item must belong to the signed-in user.")
  }

  const statusInput = typeof input.status === "string" ? input.status.toUpperCase() : "DRAFT"
  const status = (statuses.includes(statusInput as OutfitStatus) ? statusInput : "DRAFT") as OutfitStatus
  const slug = slugify(typeof input.slug === "string" ? input.slug : name)

  const outfit = await prisma.outfit.create({
    data: {
      slug,
      name,
      occasion: typeof input.occasion === "string" ? input.occasion : "Everyday",
      weather: typeof input.weather === "string" ? input.weather : "Open weather",
      reason: typeof input.reason === "string" ? input.reason : "Saved from outfit builder.",
      status,
      userId: result.user.id,
      items: {
        create: itemIds.map((itemId, position) => ({
          position,
          itemId,
        })),
      },
    },
    include: { items: { include: { item: true }, orderBy: { position: "asc" } } },
  })

  return json({ outfit }, { status: 201 })
}

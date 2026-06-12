import type { APIRoute } from "astro"
import type { EventStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { badRequest, json, requireDatabaseUser } from "@/lib/server/api"
import { parseJsonBody, slugify } from "@/lib/server/wardrobeInput"

const statuses = ["PLANNED", "NEEDS_OUTFIT", "ALTERNATE_READY"] as const

export const GET: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const events = await prisma.eventPlan.findMany({
    where: { userId: result.user.id },
    include: { outfit: true },
    orderBy: { updatedAt: "desc" },
  })

  return json({ events })
}

export const POST: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const body = await parseJsonBody(request)
  if (!body || typeof body !== "object") return badRequest("Request body must be JSON.")

  const input = body as Record<string, unknown>
  const title = typeof input.title === "string" ? input.title.trim() : ""

  if (!title) return badRequest("Event title is required.")

  const statusInput = typeof input.status === "string" ? input.status.toUpperCase().replaceAll("-", "_") : "NEEDS_OUTFIT"
  const status = (statuses.includes(statusInput as EventStatus) ? statusInput : "NEEDS_OUTFIT") as EventStatus
  const outfitId = typeof input.outfitId === "string" ? input.outfitId : undefined

  if (outfitId) {
    const outfit = await prisma.outfit.findFirst({
      where: { id: outfitId, userId: result.user.id },
      select: { id: true },
    })

    if (!outfit) return badRequest("Selected outfit does not belong to the signed-in user.")
  }

  const event = await prisma.eventPlan.create({
    data: {
      slug: slugify(typeof input.slug === "string" ? input.slug : title),
      date: typeof input.date === "string" ? input.date : "Unscheduled",
      title,
      dressCode: typeof input.dressCode === "string" ? input.dressCode : "Open",
      weather: typeof input.weather === "string" ? input.weather : "Open weather",
      status,
      userId: result.user.id,
      outfitId,
    },
    include: { outfit: true },
  })

  return json({ event }, { status: 201 })
}

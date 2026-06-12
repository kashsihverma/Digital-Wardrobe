import type { APIRoute } from "astro"

import { prisma } from "@/lib/prisma"
import { badRequest, json, requireDatabaseUser } from "@/lib/server/api"
import { parseJsonBody, parseWardrobeItemInput } from "@/lib/server/wardrobeInput"

export const PATCH: APIRoute = async ({ params, request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  if (!params.id) return badRequest("Missing wardrobe item id.")

  const existing = await prisma.wardrobeItem.findFirst({
    where: { userId: result.user.id, OR: [{ id: params.id }, { slug: params.id }] },
  })

  if (!existing) {
    return json({ error: "Wardrobe item not found." }, { status: 404 })
  }

  const parsed = parseWardrobeItemInput(await parseJsonBody(request))
  if (!parsed.ok) return badRequest(parsed.message)

  const item = await prisma.wardrobeItem.update({
    where: { id: existing.id },
    data: parsed.data,
  })

  return json({ item })
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  if (!params.id) return badRequest("Missing wardrobe item id.")

  const existing = await prisma.wardrobeItem.findFirst({
    where: { userId: result.user.id, OR: [{ id: params.id }, { slug: params.id }] },
  })

  if (!existing) {
    return json({ error: "Wardrobe item not found." }, { status: 404 })
  }

  await prisma.wardrobeItem.delete({ where: { id: existing.id } })

  return json({ ok: true })
}

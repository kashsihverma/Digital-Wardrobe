import type { APIRoute } from "astro"

import { prisma } from "@/lib/prisma"
import { badRequest, json, requireDatabaseUser } from "@/lib/server/api"
import { parseJsonBody, parseWardrobeItemInput, slugify } from "@/lib/server/wardrobeInput"

export const GET: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: result.user.id },
    orderBy: [{ updatedAt: "desc" }],
  })

  return json({ items })
}

export const POST: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  const parsed = parseWardrobeItemInput(await parseJsonBody(request))
  if (!parsed.ok) return badRequest(parsed.message)

  const baseSlug = parsed.data.slug || slugify(parsed.data.name)
  let slug = baseSlug
  let suffix = 2

  while (await prisma.wardrobeItem.findUnique({ where: { userId_slug: { userId: result.user.id, slug } } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const item = await prisma.wardrobeItem.create({
    data: {
      ...parsed.data,
      slug,
      userId: result.user.id,
    },
  })

  return json({ item }, { status: 201 })
}

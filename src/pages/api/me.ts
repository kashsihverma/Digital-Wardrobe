import type { APIRoute } from "astro"

import { json, requireDatabaseUser } from "@/lib/server/api"

export const GET: APIRoute = async ({ request }) => {
  const result = await requireDatabaseUser(request)
  if (!result.ok) return result.response

  return json({
    user: {
      id: result.user.id,
      firebaseUid: result.user.firebaseUid,
      email: result.user.email,
      name: result.user.name,
      imageUrl: result.user.imageUrl,
    },
  })
}

import type { APIRoute } from "astro"

import { json } from "@/lib/server/api"
import { setGuestCookie } from "@/lib/server/viewer"

// "Continue as guest" — sets a guest cookie that maps to the read-only demo
// account. No Firebase account required.
export const POST: APIRoute = async ({ cookies }) => {
  setGuestCookie(cookies)
  return json({ ok: true })
}

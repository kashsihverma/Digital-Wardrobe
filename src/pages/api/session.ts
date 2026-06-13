import type { APIRoute } from "astro"

import { json, upsertUserFromToken } from "@/lib/server/api"
import { getFirebaseAdminAuth, verifyRequestUser } from "@/lib/server/firebaseAdmin"
import { clearAuthCookies, setSessionCookie, SESSION_EXPIRES_IN_MS } from "@/lib/server/viewer"

// Exchange a freshly-minted Firebase ID token for a long-lived httpOnly session
// cookie so server-rendered pages can identify the viewer.
export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await verifyRequestUser(request)
  if (!auth.ok) {
    return json({ error: auth.message }, { status: auth.status })
  }

  const authorization = request.headers.get("authorization") ?? ""
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : ""

  try {
    await upsertUserFromToken(auth.token)
    const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    })
    setSessionCookie(cookies, sessionCookie)
    return json({ ok: true })
  } catch {
    return json({ error: "Could not start a session." }, { status: 500 })
  }
}

// Sign out / leave guest mode: drop both cookies.
export const DELETE: APIRoute = async ({ cookies }) => {
  clearAuthCookies(cookies)
  return json({ ok: true })
}

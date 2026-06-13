import type { AstroCookies } from "astro"

import { getFirebaseAdminAuth } from "./firebaseAdmin"

export type Viewer =
  | { state: "user"; email: string; name?: string | null }
  | { state: "guest" }
  | { state: "none" }

export const SESSION_COOKIE = "dw_session"
export const GUEST_COOKIE = "dw_guest"

const SESSION_MAX_AGE = 60 * 60 * 24 * 5 // 5 days, in seconds
const GUEST_MAX_AGE = 60 * 60 * 24 // 1 day, in seconds

// Firebase createSessionCookie expects expiresIn in milliseconds.
export const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE * 1000

function baseOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
    path: "/",
  }
}

/**
 * Resolve who is viewing from request cookies. A valid Firebase session cookie
 * wins; otherwise a guest cookie maps to the demo account; otherwise nobody.
 * If session verification fails (expired token, admin not configured), we fall
 * through to the guest cookie when present, else "none". This never exposes a
 * real account's data — getWardrobeViewData returns empty on any miss, and only
 * getDemoViewData (guest/landing) serves demo content.
 */
export async function resolveViewer(cookies: AstroCookies): Promise<Viewer> {
  const session = cookies.get(SESSION_COOKIE)?.value
  if (session) {
    try {
      const decoded = await getFirebaseAdminAuth().verifySessionCookie(session)
      if (decoded.email) {
        return { state: "user", email: decoded.email, name: decoded.name ?? null }
      }
    } catch {
      // Invalid/expired cookie or admin not configured — fall through.
    }
  }

  if (cookies.get(GUEST_COOKIE)?.value) {
    return { state: "guest" }
  }

  return { state: "none" }
}

export function setSessionCookie(cookies: AstroCookies, value: string) {
  cookies.set(SESSION_COOKIE, value, { ...baseOptions(), maxAge: SESSION_MAX_AGE })
  cookies.delete(GUEST_COOKIE, { path: "/" })
}

export function setGuestCookie(cookies: AstroCookies) {
  cookies.set(GUEST_COOKIE, "1", { ...baseOptions(), maxAge: GUEST_MAX_AGE })
  cookies.delete(SESSION_COOKIE, { path: "/" })
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" })
  cookies.delete(GUEST_COOKIE, { path: "/" })
}

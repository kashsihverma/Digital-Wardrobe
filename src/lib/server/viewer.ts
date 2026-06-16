import type { AstroCookies } from "astro"
import { SignJWT, jwtVerify } from "jose"

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

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "local-development-secret-key-change-me"
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(email: string, name?: string | null): Promise<string> {
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (payload.email && typeof payload.email === "string") {
      return {
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : null,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Resolve who is viewing from request cookies. A valid locally-signed JWT session cookie
 * wins; otherwise a guest cookie maps to the demo account; otherwise nobody.
 * We no longer contact Firebase servers on every request, making page loads much faster.
 */
export async function resolveViewer(cookies: AstroCookies): Promise<Viewer> {
  const session = cookies.get(SESSION_COOKIE)?.value
  if (session) {
    const decoded = await verifySessionToken(session)
    if (decoded) {
      return { state: "user", email: decoded.email, name: decoded.name }
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

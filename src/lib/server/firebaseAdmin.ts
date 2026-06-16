import { createRemoteJWKSet, jwtVerify } from "jose"

export interface DecodedIdToken {
  uid: string
  email?: string
  name?: string
  picture?: string
  [key: string]: any
}

type AuthResult =
  | { ok: true; token: DecodedIdToken }
  | { ok: false; status: number; message: string }

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
)

export async function verifyRequestUser(request: Request): Promise<AuthResult> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : ""

  if (!token) {
    return { ok: false, status: 401, message: "Missing Firebase ID token." }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!projectId) {
    return { ok: false, status: 501, message: "Firebase Project ID is not configured on the server." }
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      clockTolerance: "60s",
    })

    const decoded: DecodedIdToken = {
      uid: payload.sub!,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
      ...payload,
    }

    return { ok: true, token: decoded }
  } catch (error) {
    console.error("Firebase ID Token verification error:", error, { projectId })
    return { ok: false, status: 401, message: "Invalid or expired Firebase ID token." }
  }
}

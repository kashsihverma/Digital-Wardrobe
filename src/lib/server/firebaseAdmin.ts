import "dotenv/config"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

type AuthResult =
  | { ok: true; token: DecodedIdToken }
  | { ok: false; status: number; message: string }

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
}

function hasAdminConfig() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && getPrivateKey())
}

export function getFirebaseAdminAuth() {
  if (!hasAdminConfig()) {
    throw new Error("Firebase Admin is not configured.")
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    })
  }

  return getAuth()
}

export async function verifyRequestUser(request: Request): Promise<AuthResult> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : ""

  if (!token) {
    return { ok: false, status: 401, message: "Missing Firebase ID token." }
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token)
    return { ok: true, token: decoded }
  } catch (error) {
    const message = error instanceof Error && error.message.includes("not configured")
      ? "Firebase Admin is not configured on the server."
      : "Invalid or expired Firebase ID token."

    return { ok: false, status: message.includes("configured") ? 501 : 401, message }
  }
}

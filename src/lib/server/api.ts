import type { DecodedIdToken } from "firebase-admin/auth"

import { prisma } from "@/lib/prisma"
import { verifyRequestUser } from "./firebaseAdmin"

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
}

export function badRequest(message: string, details?: unknown) {
  return json({ error: message, details }, { status: 400 })
}

export async function requireDatabaseUser(request: Request) {
  const auth = await verifyRequestUser(request)

  if (!auth.ok) {
    return {
      ok: false as const,
      response: json({ error: auth.message }, { status: auth.status }),
    }
  }

  const user = await upsertUserFromToken(auth.token)

  return {
    ok: true as const,
    firebaseUser: auth.token,
    user,
  }
}

async function upsertUserFromToken(token: DecodedIdToken) {
  const email = token.email

  if (!email) {
    throw new Error("Firebase user does not have an email address.")
  }

  return prisma.user.upsert({
    where: { email },
    update: {
      firebaseUid: token.uid,
      name: token.name ?? undefined,
      imageUrl: token.picture ?? undefined,
    },
    create: {
      firebaseUid: token.uid,
      email,
      name: token.name ?? undefined,
      imageUrl: token.picture ?? undefined,
    },
  })
}

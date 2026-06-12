import "dotenv/config"

import { cert, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const

function fail(message: string): never {
  console.error(`Firebase Admin check failed: ${message}`)
  process.exit(1)
}

function getEnv(name: (typeof required)[number]) {
  const value = process.env[name]?.trim()
  if (!value) fail(`Missing ${name} in .env.`)
  return value
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n")
}

function assertPrivateKeyShape(privateKey: string) {
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    fail("FIREBASE_PRIVATE_KEY is missing the BEGIN PRIVATE KEY header.")
  }

  if (!privateKey.includes("-----END PRIVATE KEY-----")) {
    fail("FIREBASE_PRIVATE_KEY is missing the END PRIVATE KEY footer.")
  }

  if (!privateKey.includes("\n")) {
    fail("FIREBASE_PRIVATE_KEY must include escaped newlines as \\n or real line breaks.")
  }
}

const projectId = getEnv("FIREBASE_PROJECT_ID")
const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL")
const privateKey = normalizePrivateKey(getEnv("FIREBASE_PRIVATE_KEY"))

assertPrivateKeyShape(privateKey)

try {
  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  getAuth(app)

  console.log("Firebase Admin check passed.")
  console.log(`Project: ${projectId}`)
  console.log(`Client email: ${clientEmail}`)
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown initialization error."
  fail(message)
}

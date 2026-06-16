import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const connectionString = process.env.DATABASE_URL

if (connectionString && typeof globalThis.WebSocket === "undefined") {
  const wsModule = "ws"
  const ws = await import(/* @vite-ignore */ wsModule)
  neonConfig.webSocketConstructor = ws.default || ws
}

let prismaInstance: PrismaClient

if (connectionString) {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
} else {
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV === "development") {
  globalForPrisma.prisma = prisma
}

import { AsyncLocalStorage } from "node:async_hooks"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"

// Request-scoped PrismaClient store for Cloudflare Workers request isolation
export const prismaStorage = new AsyncLocalStorage<PrismaClient>()

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Setup WebSocket for Neon in environments without native WebSocket (like local Node)
if (typeof globalThis.WebSocket === "undefined") {
  const wsModule = "ws"
  const ws = await import(/* @vite-ignore */ wsModule)
  neonConfig.webSocketConstructor = ws.default || ws
}

// Factory function to create a new Prisma Client instance
export function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    (globalThis as any).DATABASE_URL ||
    (globalThis as any).process?.env?.DATABASE_URL

  if (connectionString) {
    const adapter = new PrismaNeon({ connectionString })
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

// Fallback global client for non-request environments (e.g. seeds, migrations, builds)
let globalPrismaInstance: PrismaClient | null = null

function getGlobalPrismaInstance(): PrismaClient {
  if (globalPrismaInstance) return globalPrismaInstance

  if (globalForPrisma.prisma) {
    globalPrismaInstance = globalForPrisma.prisma
    return globalPrismaInstance
  }

  globalPrismaInstance = createPrismaClient()

  if (process.env.NODE_ENV === "development") {
    globalForPrisma.prisma = globalPrismaInstance
  }

  return globalPrismaInstance
}

// The exported prisma proxy resolves to the request-scoped client if running in a request context,
// or falls back to the global instance otherwise.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = prismaStorage.getStore() || getGlobalPrismaInstance()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})


import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Setup WebSocket for Neon in environments without native WebSocket (like local Node)
if (typeof globalThis.WebSocket === "undefined") {
  const wsModule = "ws"
  const ws = await import(/* @vite-ignore */ wsModule)
  neonConfig.webSocketConstructor = ws.default || ws
}

let prismaInstance: PrismaClient | null = null

function getPrismaInstance(): PrismaClient {
  if (prismaInstance) return prismaInstance

  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma
    return prismaInstance
  }

  const connectionString =
    process.env.DATABASE_URL ||
    (globalThis as any).DATABASE_URL ||
    (globalThis as any).process?.env?.DATABASE_URL

  if (connectionString) {
    const adapter = new PrismaNeon({ connectionString })
    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })

    if (process.env.NODE_ENV === "development") {
      globalForPrisma.prisma = prismaInstance
    }

    return prismaInstance
  }

  // Do NOT cache the instance if connectionString is not set yet,
  // as it might be evaluated during startup before env is injected.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrismaInstance()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})


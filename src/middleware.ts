import { defineMiddleware } from "astro:middleware"

import { resolveViewer } from "@/lib/server/viewer"

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    const { env } = await import("cloudflare:workers")
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value
          ;(globalThis as any)[key] = value
        }
      }
    }
  } catch (err) {
    // Fallback if not in Cloudflare Worker context (e.g. build time or node scripts)
  }

  context.locals.viewer = await resolveViewer(context.cookies)
  return next()
})


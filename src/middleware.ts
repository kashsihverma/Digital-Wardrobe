import { defineMiddleware } from "astro:middleware"

import { resolveViewer } from "@/lib/server/viewer"

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.viewer = await resolveViewer(context.cookies)
  return next()
})

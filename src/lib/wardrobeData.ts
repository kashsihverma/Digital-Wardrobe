import type { EventPlan, Outfit, WardrobeItem } from "@/data/wardrobe"
import { events as fallbackEvents, insights as fallbackInsights, outfits as fallbackOutfits, suggestions as fallbackSuggestions, wardrobeItems as fallbackItems } from "@/data/wardrobe"
import { prisma } from "@/lib/prisma"
import type { Viewer } from "@/lib/server/viewer"

const DEMO_EMAIL = "demo@digital-wardrobe.local"

const lower = (value: string) => value.toLowerCase()
const status = (value: string) => lower(value).replaceAll("_", "-")

type Suggestion = { title: string; reason: string; tag: string }
type Insight = { label: string; value: string; detail: string }

export type ViewData = {
  wardrobeItems: WardrobeItem[]
  outfits: Outfit[]
  events: EventPlan[]
  suggestions: Suggestion[]
  insights: Insight[]
}

/**
 * Load one account's wardrobe from the database. Returns null when the user
 * does not exist or the query fails, so callers decide their own fallback.
 */
async function loadUserData(email: string): Promise<ViewData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        items: { orderBy: { updatedAt: "desc" } },
        outfits: {
          include: {
            items: { include: { item: true }, orderBy: { position: "asc" } },
          },
          orderBy: { updatedAt: "desc" },
        },
        events: { include: { outfit: true }, orderBy: { updatedAt: "desc" } },
        suggestions: { orderBy: { createdAt: "desc" } },
        insights: { orderBy: { label: "asc" } },
      },
    })

    if (!user) return null

    const wardrobeItems: WardrobeItem[] = user.items.map((item) => ({
      id: item.slug,
      name: item.name,
      type: item.type,
      subcategory: item.subcategory,
      color: item.color,
      season: item.season,
      occasion: item.occasion,
      brand: item.brand,
      notes: item.notes,
      imageUrl: item.imageUrl ?? undefined,
      wears: item.wears,
      lastWorn: item.lastWorn,
      status: status(item.status) as WardrobeItem["status"],
      tone: lower(item.tone) as WardrobeItem["tone"],
      shape: lower(item.shape) as WardrobeItem["shape"],
    }))

    const outfits: Outfit[] = user.outfits.map((outfit) => ({
      id: outfit.slug,
      name: outfit.name,
      occasion: outfit.occasion,
      weather: outfit.weather,
      items: outfit.items.map((link) => link.item.slug),
      reason: outfit.reason,
      status: status(outfit.status) as Outfit["status"],
    }))

    const events: EventPlan[] = user.events.map((event) => ({
      id: event.slug,
      date: event.date,
      title: event.title,
      dressCode: event.dressCode,
      weather: event.weather,
      outfit: event.outfit?.name ?? "Needs outfit",
      status: status(event.status) as EventPlan["status"],
    }))

    return {
      wardrobeItems,
      outfits,
      events,
      suggestions: user.suggestions.map(({ title, reason, tag }) => ({ title, reason, tag })),
      insights: user.insights.map(({ label, value, detail }) => ({ label, value, detail })),
    }
  } catch (error) {
    console.error("loadUserData exception:", error)
    return null
  }
}

export function emptyViewData(): ViewData {
  return { wardrobeItems: [], outfits: [], events: [], suggestions: [], insights: [] }
}

function fallbackData(): ViewData {
  return {
    wardrobeItems: fallbackItems,
    outfits: fallbackOutfits,
    events: fallbackEvents,
    suggestions: fallbackSuggestions,
    insights: fallbackInsights,
  }
}

/** Demo account — used for the public landing showcase and guest mode. */
export async function getDemoViewData(): Promise<ViewData> {
  return (await loadUserData(DEMO_EMAIL)) ?? fallbackData()
}

/** A real account. Never falls back to demo content — empty means empty. */
export async function getWardrobeViewData(email: string): Promise<ViewData> {
  return (await loadUserData(email)) ?? emptyViewData()
}

/** Resolve the right dataset for the current viewer. */
export async function getViewDataForViewer(viewer: Viewer | undefined): Promise<ViewData> {
  if (viewer?.state === "guest") return getDemoViewData()
  if (viewer?.state === "user") return getWardrobeViewData(viewer.email)
  return emptyViewData()
}

export async function getWardrobeItemBySlug(slug: string, viewer: Viewer | undefined) {
  const data = await getViewDataForViewer(viewer)
  return {
    ...data,
    item: data.wardrobeItems.find((candidate) => candidate.id === slug),
  }
}

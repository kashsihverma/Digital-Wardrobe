import type { EventPlan, Outfit, WardrobeItem } from "@/data/wardrobe"
import { events as fallbackEvents, insights as fallbackInsights, outfits as fallbackOutfits, suggestions as fallbackSuggestions, wardrobeItems as fallbackItems } from "@/data/wardrobe"
import { prisma } from "@/lib/prisma"

const DEMO_EMAIL = "demo@digital-wardrobe.local"

const lower = (value: string) => value.toLowerCase()
const status = (value: string) => lower(value).replaceAll("_", "-")

export async function getWardrobeViewData(email = DEMO_EMAIL) {
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

    if (!user) return fallbackData()

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
  } catch {
    return fallbackData()
  }
}

export async function getWardrobeItemBySlug(slug: string) {
  const data = await getWardrobeViewData()
  return {
    ...data,
    item: data.wardrobeItems.find((candidate) => candidate.id === slug),
  }
}

function fallbackData() {
  return {
    wardrobeItems: fallbackItems,
    outfits: fallbackOutfits,
    events: fallbackEvents,
    suggestions: fallbackSuggestions,
    insights: fallbackInsights,
  }
}

import { PrismaClient } from "@prisma/client"

import { events, insights, outfits, suggestions, wardrobeItems } from "../src/data/wardrobe"

const prisma = new PrismaClient()

const statusMap = {
  ready: "READY",
  review: "REVIEW",
  underused: "UNDERUSED",
  favorite: "FAVORITE",
} as const

const toneMap = {
  sand: "SAND",
  sage: "SAGE",
  berry: "BERRY",
  ink: "INK",
  cream: "CREAM",
  stone: "STONE",
} as const

const shapeMap = {
  jacket: "JACKET",
  top: "TOP",
  dress: "DRESS",
  trouser: "TROUSER",
  skirt: "SKIRT",
  shoe: "SHOE",
  bag: "BAG",
} as const

const outfitStatusMap = {
  planned: "PLANNED",
  draft: "DRAFT",
  worn: "WORN",
} as const

const eventStatusMap = {
  planned: "PLANNED",
  "needs-outfit": "NEEDS_OUTFIT",
  "alternate-ready": "ALTERNATE_READY",
} as const

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@digital-wardrobe.local" },
    update: { name: "Demo Wardrobe" },
    create: {
      email: "demo@digital-wardrobe.local",
      name: "Demo Wardrobe",
    },
  })

  for (const item of wardrobeItems) {
    await prisma.wardrobeItem.upsert({
      where: { userId_slug: { userId: user.id, slug: item.id } },
      update: {
        name: item.name,
        type: item.type,
        subcategory: item.subcategory,
        color: item.color,
        season: item.season,
        occasion: item.occasion,
        brand: item.brand,
        notes: item.notes,
        imageUrl: "imageUrl" in item ? item.imageUrl : undefined,
        wears: item.wears,
        lastWorn: item.lastWorn,
        status: statusMap[item.status],
        tone: toneMap[item.tone],
        shape: shapeMap[item.shape],
      },
      create: {
        slug: item.id,
        name: item.name,
        type: item.type,
        subcategory: item.subcategory,
        color: item.color,
        season: item.season,
        occasion: item.occasion,
        brand: item.brand,
        notes: item.notes,
        imageUrl: "imageUrl" in item ? item.imageUrl : undefined,
        wears: item.wears,
        lastWorn: item.lastWorn,
        status: statusMap[item.status],
        tone: toneMap[item.tone],
        shape: shapeMap[item.shape],
        userId: user.id,
      },
    })
  }

  for (const outfit of outfits) {
    const savedOutfit = await prisma.outfit.upsert({
      where: { userId_slug: { userId: user.id, slug: outfit.id } },
      update: {
        name: outfit.name,
        occasion: outfit.occasion,
        weather: outfit.weather,
        reason: outfit.reason,
        status: outfitStatusMap[outfit.status],
      },
      create: {
        slug: outfit.id,
        name: outfit.name,
        occasion: outfit.occasion,
        weather: outfit.weather,
        reason: outfit.reason,
        status: outfitStatusMap[outfit.status],
        userId: user.id,
      },
    })

    await prisma.outfitItem.deleteMany({ where: { outfitId: savedOutfit.id } })

    for (const [position, itemSlug] of outfit.items.entries()) {
      const item = await prisma.wardrobeItem.findUnique({
        where: { userId_slug: { userId: user.id, slug: itemSlug } },
      })

      if (!item) continue

      await prisma.outfitItem.create({
        data: {
          outfitId: savedOutfit.id,
          itemId: item.id,
          position,
        },
      })
    }
  }

  for (const event of events) {
    const outfit = await prisma.outfit.findFirst({
      where: { userId: user.id, name: event.outfit },
    })

    await prisma.eventPlan.upsert({
      where: { userId_slug: { userId: user.id, slug: event.id } },
      update: {
        date: event.date,
        title: event.title,
        dressCode: event.dressCode,
        weather: event.weather,
        status: eventStatusMap[event.status],
        outfitId: outfit?.id ?? null,
      },
      create: {
        slug: event.id,
        date: event.date,
        title: event.title,
        dressCode: event.dressCode,
        weather: event.weather,
        status: eventStatusMap[event.status],
        outfitId: outfit?.id,
        userId: user.id,
      },
    })
  }

  await prisma.suggestion.deleteMany({ where: { userId: user.id } })
  await prisma.suggestion.createMany({
    data: suggestions.map((suggestion) => ({
      title: suggestion.title,
      reason: suggestion.reason,
      tag: suggestion.tag,
      userId: user.id,
    })),
  })

  for (const insight of insights) {
    await prisma.insightMetric.upsert({
      where: { userId_label: { userId: user.id, label: insight.label } },
      update: {
        value: insight.value,
        detail: insight.detail,
      },
      create: {
        label: insight.label,
        value: insight.value,
        detail: insight.detail,
        userId: user.id,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

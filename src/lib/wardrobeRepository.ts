import { prisma } from "./prisma"

export async function getUserWardrobeDashboard(userId: string) {
  const [items, outfits, events, suggestions, insights] = await Promise.all([
    prisma.wardrobeItem.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.outfit.findMany({
      where: { userId },
      include: {
        items: {
          include: { item: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.eventPlan.findMany({
      where: { userId },
      include: { outfit: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.suggestion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.insightMetric.findMany({
      where: { userId },
      orderBy: { label: "asc" },
    }),
  ])

  return { items, outfits, events, suggestions, insights }
}

export async function getOrCreateUserFromAuth(input: {
  firebaseUid?: string | null
  email: string
  name?: string | null
  imageUrl?: string | null
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      firebaseUid: input.firebaseUid ?? undefined,
      name: input.name ?? undefined,
      imageUrl: input.imageUrl ?? undefined,
    },
    create: {
      firebaseUid: input.firebaseUid ?? undefined,
      email: input.email,
      name: input.name ?? undefined,
      imageUrl: input.imageUrl ?? undefined,
    },
  })
}

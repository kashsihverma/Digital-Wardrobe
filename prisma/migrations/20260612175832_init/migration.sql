-- CreateEnum
CREATE TYPE "WardrobeStatus" AS ENUM ('ready', 'review', 'underused', 'favorite');

-- CreateEnum
CREATE TYPE "WardrobeTone" AS ENUM ('sand', 'sage', 'berry', 'ink', 'cream', 'stone');

-- CreateEnum
CREATE TYPE "WardrobeShape" AS ENUM ('jacket', 'top', 'dress', 'trouser', 'skirt', 'shoe', 'bag');

-- CreateEnum
CREATE TYPE "OutfitStatus" AS ENUM ('planned', 'draft', 'worn');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('planned', 'needs-outfit', 'alternate-ready');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WardrobeItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "wears" INTEGER NOT NULL DEFAULT 0,
    "lastWorn" TEXT NOT NULL,
    "status" "WardrobeStatus" NOT NULL DEFAULT 'ready',
    "tone" "WardrobeTone" NOT NULL,
    "shape" "WardrobeShape" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WardrobeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "weather" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "OutfitStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "outfitId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfitId","itemId")
);

-- CreateTable
CREATE TABLE "EventPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dressCode" TEXT NOT NULL,
    "weather" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'needs-outfit',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT,

    CONSTRAINT "EventPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightMetric" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InsightMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "WardrobeItem_userId_status_idx" ON "WardrobeItem"("userId", "status");

-- CreateIndex
CREATE INDEX "WardrobeItem_userId_occasion_idx" ON "WardrobeItem"("userId", "occasion");

-- CreateIndex
CREATE UNIQUE INDEX "WardrobeItem_userId_slug_key" ON "WardrobeItem"("userId", "slug");

-- CreateIndex
CREATE INDEX "Outfit_userId_status_idx" ON "Outfit"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Outfit_userId_slug_key" ON "Outfit"("userId", "slug");

-- CreateIndex
CREATE INDEX "OutfitItem_itemId_idx" ON "OutfitItem"("itemId");

-- CreateIndex
CREATE INDEX "EventPlan_userId_status_idx" ON "EventPlan"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventPlan_userId_slug_key" ON "EventPlan"("userId", "slug");

-- CreateIndex
CREATE INDEX "Suggestion_userId_tag_idx" ON "Suggestion"("userId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "InsightMetric_userId_label_key" ON "InsightMetric"("userId", "label");

-- AddForeignKey
ALTER TABLE "WardrobeItem" ADD CONSTRAINT "WardrobeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlan" ADD CONSTRAINT "EventPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlan" ADD CONSTRAINT "EventPlan_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightMetric" ADD CONSTRAINT "InsightMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

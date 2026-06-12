"use client"

import { useState } from "react"
import { CheckCircle2, Heart, Loader2, Trash2 } from "lucide-react"

import type { WardrobeItem } from "@/data/wardrobe"
import { Button } from "@/components/ui/button"
import { getAuthHeaders } from "@/lib/clientAuth"

type Props = {
  item: WardrobeItem
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date())
}

export function WardrobeItemActions({ item }: Props) {
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const sendToast = (message: string) => {
    window.dispatchEvent(new CustomEvent("dw:toast", { detail: { message } }))
  }

  const updateItem = async (action: string, data: Partial<WardrobeItem>) => {
    setBusyAction(action)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/wardrobe/${item.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ...item,
          ...data,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Could not update this item.")
      }

      sendToast(action === "wear" ? "Wear count updated." : "Item updated.")
      window.setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      sendToast(error instanceof Error ? error.message : "Sign in before updating this item.")
    } finally {
      setBusyAction(null)
    }
  }

  const deleteItem = async () => {
    setBusyAction("delete")

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/wardrobe/${item.id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Could not delete this item.")
      }

      sendToast("Item deleted from your wardrobe.")
      window.setTimeout(() => window.location.assign("/wardrobe"), 500)
    } catch (error) {
      sendToast(error instanceof Error ? error.message : "Sign in before deleting this item.")
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <Button
        className="min-h-11 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink shadow-[var(--shadow-hairline)] hover:bg-canvas-soft"
        disabled={Boolean(busyAction)}
        onClick={() => updateItem("wear", { wears: item.wears + 1, lastWorn: formatToday(), status: "ready" })}
        type="button"
      >
        {busyAction === "wear" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Mark worn
      </Button>
      <Button
        className="min-h-11 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink shadow-[var(--shadow-hairline)] hover:bg-canvas-soft"
        disabled={Boolean(busyAction)}
        onClick={() => updateItem("favorite", { status: "favorite" })}
        type="button"
      >
        {busyAction === "favorite" ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
        Favorite
      </Button>
      <Button
        className="min-h-11 rounded-full border border-[#f7d4d6] bg-canvas px-4 text-sm font-medium text-[#c50000] hover:bg-[#fff7f8]"
        disabled={Boolean(busyAction)}
        onClick={deleteItem}
        type="button"
      >
        {busyAction === "delete" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        Delete
      </Button>
    </div>
  )
}

export default WardrobeItemActions

"use client"

import { useState } from "react"
import { Camera, Link2, Upload, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const uploadRoutes = [
  {
    icon: Camera,
    title: "Take photo",
    detail: "Secure camera capture with upload fallback.",
  },
  {
    icon: Upload,
    title: "Upload image",
    detail: "Add cutouts from your camera roll or desktop.",
  },
  {
    icon: Link2,
    title: "Import link",
    detail: "Save a screenshot or product reference.",
  },
]

export function UploadActions() {
  const [selectedRoute, setSelectedRoute] = useState(uploadRoutes[0].title)
  const [saved, setSaved] = useState(false)

  const sendToast = (message: string) => {
    window.dispatchEvent(new CustomEvent("dw:toast", { detail: { message } }))
  }

  const handleSave = () => {
    setSaved(true)
    sendToast("Item saved as a private draft with tags ready to review.")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-full bg-ink px-4 text-white hover:bg-ink/90">
          <Camera className="size-4" />
          Add item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px] rounded-lg border-hairline bg-canvas p-0 text-ink shadow-[var(--shadow-float)]">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-semibold">
              Add wardrobe item.
            </DialogTitle>
            <DialogDescription className="text-sm text-body">
              Capture, clean, auto-tag, and confirm in one pass.
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="rounded-full border border-hairline p-2 text-body transition hover:bg-canvas-soft" aria-label="Close upload dialog">
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="grid gap-3 p-5">
          {uploadRoutes.map((route) => {
            const Icon = route.icon
            const isSelected = selectedRoute === route.title
            return (
              <button
                aria-pressed={isSelected}
                className={`flex min-h-20 items-center gap-4 rounded-lg border px-4 py-3 text-left transition hover:bg-canvas-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
                  isSelected ? "border-ink bg-canvas-soft" : "border-hairline bg-canvas"
                }`}
                key={route.title}
                onClick={() => {
                  setSelectedRoute(route.title)
                  sendToast(`${route.title} selected. Preview and fallback controls are ready.`)
                }}
                type="button"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-canvas-soft text-ink">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{route.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-body">{route.detail}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-hairline bg-canvas-soft px-5 py-4">
          <div className="mb-4 rounded-lg border border-hairline bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {saved ? "Draft item saved." : "One-screen tag confirmation."}
                </p>
                <p className="mt-1 text-xs leading-5 text-body">
                  {selectedRoute} will create a cutout preview, then pre-fill tags with confidence markers.
                </p>
              </div>
              <span className="rounded-full bg-canvas-soft px-2 py-1 text-xs text-body">
                {saved ? "Saved" : "Draft"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["Blazer 92%", "Camel 88%", "Work 74%"].map((tag) => (
                <span className="rounded-full border border-hairline bg-canvas px-2 py-1 text-center text-xs text-body" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Badge className="rounded-full bg-white text-body shadow-[var(--shadow-hairline)]">
              Auto-tag preview
            </Badge>
            <Badge className="rounded-full bg-white text-body shadow-[var(--shadow-hairline)]">
              Private by default
            </Badge>
          </div>
          <label className="mb-2 block text-xs font-medium text-body" htmlFor="import-url">
            Paste image or product link
          </label>
          <div className="flex gap-2">
            <Input
              className="h-10 rounded-lg border-hairline bg-white text-sm"
              id="import-url"
              placeholder="https://..."
              type="url"
            />
            <Button className="h-10 rounded-lg bg-ink px-3 text-white hover:bg-ink/90" onClick={handleSave} type="button">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadActions

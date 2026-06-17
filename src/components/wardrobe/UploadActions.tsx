"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Loader2,
  LockKeyhole,
  Upload,
  X,
} from "lucide-react"

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
import { getAuthHeaders } from "@/lib/clientAuth"
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase"

type CaptureMode = "camera" | "upload" | "link"

type UploadActionsProps = {
  triggerClassName?: string
}

const captureModes: Array<{
  id: CaptureMode
  icon: typeof Camera
  label: string
  detail: string
}> = [
  { id: "camera", icon: Camera, label: "Take photo", detail: "Use your webcam or phone camera." },
  { id: "upload", icon: Upload, label: "Upload image", detail: "Pick an image from this device." },
  { id: "link", icon: Link2, label: "Import link", detail: "Use a hosted product image." },
]

const typeOptions = ["Top", "Outerwear", "Bottom", "Dress", "Shoes", "Accessory"]
const colorOptions = ["Ivory", "Camel", "Sage", "Black", "Berry", "Cream", "Sand", "Cocoa"]
const occasionOptions = ["Everyday", "Work", "Dinner", "Travel", "Weekend", "Brunch"]
const seasonOptions = ["All season", "Spring", "Summer", "Fall", "Winter"]

const shapeByType: Record<string, string> = {
  Accessory: "BAG",
  Bottom: "TROUSER",
  Dress: "DRESS",
  Outerwear: "JACKET",
  Shoes: "SHOE",
  Top: "TOP",
}

const toneByColor: Record<string, string> = {
  Berry: "BERRY",
  Black: "INK",
  Camel: "SAND",
  Cocoa: "STONE",
  Cream: "CREAM",
  Ivory: "CREAM",
  Sage: "SAGE",
  Sand: "SAND",
}

const initialForm = {
  brand: "",
  color: "Ivory",
  imageUrl: "",
  name: "",
  notes: "",
  occasion: "Everyday",
  season: "All season",
  subcategory: "",
  type: "Top",
}

const fieldClass = "h-11 rounded-md border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-mute"
const labelClass = "grid gap-1.5 text-sm font-medium text-ink"
const selectClass =
  "h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/20"
const frameClass = "mt-3 aspect-[4/5] w-full overflow-hidden rounded-md"

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result)))
    reader.addEventListener("error", () => reject(new Error("Image could not be read.")))
    reader.readAsDataURL(file)
  })
}

function compressImage(file: File, maxSizeBytes: number = 2_800_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        const maxEdge = 1600
        if (Math.max(width, height) > maxEdge) {
          const scale = maxEdge / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not initialize canvas context for compression."))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        const byteLength = (url: string) => Math.ceil((url.length - (url.indexOf(",") + 1)) * 0.75)
        
        let quality = 0.85
        let dataUrl = canvas.toDataURL("image/jpeg", quality)

        while (byteLength(dataUrl) > maxSizeBytes && quality > 0.3) {
          quality -= 0.1
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        resolve(dataUrl)
      }
      img.onerror = () => {
        reject(new Error("Could not load image for compression."))
      }
      img.src = String(e.target?.result)
    }
    reader.onerror = () => {
      reject(new Error("Could not read file."))
    }
    reader.readAsDataURL(file)
  })
}

export function UploadActions({ triggerClassName = "" }: UploadActionsProps) {
  const [open, setOpen] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [mode, setMode] = useState<CaptureMode>("camera")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState(initialForm)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camStatus, setCamStatus] = useState<"idle" | "starting" | "live" | "error">("idle")
  const [cameraRequested, setCameraRequested] = useState(false)
  const [camAttempt, setCamAttempt] = useState(0)
  const [caps, setCaps] = useState({ hasCameraApi: false, isCoarse: false, isSecure: false })

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setAuthReady(true)
      return
    }

    let unsubscribe = () => {}
    getFirebaseAuth()
      .then((auth) => {
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser)
          setAuthReady(true)
        })
      })
      .catch(() => setAuthReady(true))

    return () => unsubscribe()
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  // Empty-state "Add your first item" buttons dispatch this event to open the dialog.
  useEffect(() => {
    const openDialog = () => setOpen(true)
    window.addEventListener("dw:add-item", openDialog)
    return () => window.removeEventListener("dw:add-item", openDialog)
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") return
    setCaps({
      hasCameraApi: Boolean(navigator.mediaDevices?.getUserMedia),
      isCoarse: Boolean(window.matchMedia?.("(pointer: coarse)")?.matches),
      isSecure: window.isSecureContext,
    })
  }, [])

  const canSave = Boolean(user && form.name.trim() && form.type.trim() && form.color.trim())
  const previewUrl = form.imageUrl.trim()
  const useNativeCapture = caps.isCoarse || !caps.hasCameraApi || !caps.isSecure
  const cameraLive = open && mode === "camera" && !previewUrl && !useNativeCapture && cameraRequested
  const signInHref = `/sign-in?redirect=${encodeURIComponent(typeof window === "undefined" ? "/wardrobe" : window.location.pathname)}`

  const autoTags = useMemo(
    () => [`${form.type || "Item"} 92%`, `${form.color || "Color"} 88%`, `${form.occasion || "Everyday"} 74%`],
    [form.color, form.occasion, form.type],
  )

  const sendToast = useCallback((message: string) => {
    window.dispatchEvent(new CustomEvent("dw:toast", { detail: { message } }))
  }, [])

  const reset = () => {
    stopStream()
    setCameraRequested(false)
    setCamStatus("idle")
    setMode("camera")
    setSaving(false)
    setSaved(false)
    setError("")
    setForm(initialForm)
  }

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "type" && !current.subcategory ? { subcategory: value } : {}),
    }))
    setError("")
  }

  const handleFile = async (file?: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.")
      return
    }

    let targetFileUrl: string
    if (file.size > 1_500_000) {
      sendToast("Compressing large image...")
      try {
        targetFileUrl = await compressImage(file)
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Image could not be compressed.")
        return
      }
    } else {
      try {
        targetFileUrl = await readFileAsDataUrl(file)
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Image could not be loaded.")
        return
      }
    }

    const byteLength = (url: string) => Math.ceil((url.length - (url.indexOf(",") + 1)) * 0.75)
    if (byteLength(targetFileUrl) > 3_000_000) {
      setError("Use an image under 3.0 MB for now.")
      return
    }

    updateForm("imageUrl", targetFileUrl)
    if (!form.name.trim()) {
      updateForm("name", file.name.replace(/\.[^.]+$/, "").replaceAll("-", " "))
    }
    sendToast("Image preview ready.")
  }

  const chooseMode = (nextMode: CaptureMode) => {
    if (nextMode !== "camera") {
      stopStream()
      setCameraRequested(false)
      setCamStatus("idle")
    }
    setMode(nextMode)
    setError("")

    // Desktop camera mode opens a live getUserMedia stream (driven by the effect),
    // so it never clicks the hidden file input.
    if (nextMode === "camera" && !useNativeCapture) {
      setCamStatus("starting")
      setCameraRequested(true)
      return
    }

    window.requestAnimationFrame(() => {
      if (nextMode === "camera") {
        if (cameraInputRef.current) cameraInputRef.current.value = ""
        cameraInputRef.current?.click()
      }
      if (nextMode === "upload") {
        if (uploadInputRef.current) uploadInputRef.current.value = ""
        uploadInputRef.current?.click()
      }
    })
  }

  const replaceImage = () => {
    if (mode === "camera" && !useNativeCapture) {
      setCamStatus("starting")
      setCameraRequested(true)
      updateForm("imageUrl", "")
      return
    }
    chooseMode(mode === "link" ? "upload" : mode)
  }

  const handleFrameClick = () => {
    if (previewUrl) {
      replaceImage()
      return
    }
    if (mode === "camera" && !useNativeCapture) {
      setError("")
      setCamStatus("starting")
      setCameraRequested(true)
      return
    }
    chooseMode(mode === "link" ? "upload" : mode)
  }

  const retryCamera = () => {
    setError("")
    setCamStatus("starting")
    setCamAttempt((value) => value + 1)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("Camera is still warming up — try again in a moment.")
      return
    }

    const canvas = document.createElement("canvas")
    const maxEdge = 1280
    const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      stopStream()
      setCamStatus("idle")
      setError("Capture failed — use Upload instead.")
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // base64 payload decodes to ~3/4 of its string length; check decoded bytes, not chars.
    const byteLength = (url: string) => Math.ceil((url.length - (url.indexOf(",") + 1)) * 0.75)
    let quality = 0.82
    let dataUrl = canvas.toDataURL("image/jpeg", quality)
    while (byteLength(dataUrl) > 2_800_000 && quality > 0.4) {
      quality -= 0.1
      dataUrl = canvas.toDataURL("image/jpeg", quality)
    }
    if (byteLength(dataUrl) > 3_000_000) {
      stopStream()
      setCamStatus("idle")
      setError("Use an image under 3.0 MB for now.")
      return
    }

    stopStream()
    setCamStatus("idle")
    updateForm("imageUrl", dataUrl)
    if (!form.name.trim()) updateForm("name", "Camera capture")
    sendToast("Photo captured.")
  }

  const handleSave = async () => {
    if (!user) {
      setError("Sign in before adding wardrobe items.")
      return
    }

    if (!canSave) {
      setError("Name, type, and color are required.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/wardrobe", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          brand: form.brand.trim() || "Unspecified",
          lastWorn: "Not worn yet",
          notes: form.notes.trim() || "Added from Digital Wardrobe.",
          shape: shapeByType[form.type] ?? "TOP",
          status: "REVIEW",
          subcategory: form.subcategory.trim() || form.type,
          tone: toneByColor[form.color] ?? "STONE",
          wears: 0,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Item could not be saved.")
      }

      setSaved(true)
      sendToast("Item saved to your private wardrobe.")
      window.setTimeout(() => window.location.reload(), 700)
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Item could not be saved."
      setError(message)
      sendToast(message)
    } finally {
      setSaving(false)
    }
  }

  // Single source of truth for the camera stream: starts when cameraLive flips true
  // (or on retry via camAttempt) and the cleanup stops every track on capture, mode
  // switch, dialog close, and unmount — so the camera indicator light never lingers.
  useEffect(() => {
    if (!cameraLive) {
      setCamStatus("idle")
      return
    }

    let cancelled = false
    setCamStatus("starting")

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1280 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        if (!cancelled) setCamStatus("live")
      } catch (nextError) {
        if (cancelled) return
        const name = nextError instanceof DOMException ? nextError.name : ""
        const message =
          name === "NotAllowedError" || name === "SecurityError"
            ? "Camera access was blocked. Allow it in your browser, or use Upload."
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "No camera found. Try Upload or Import link."
              : name === "NotReadableError"
                ? "Your camera is busy in another app. Close it and retry, or use Upload."
                : name === "NotSupportedError"
                  ? "Camera isn't available in this context. Use Upload or Import link."
                  : "Camera could not start. Use Upload or Import link."
        setError(message)
        sendToast(message)
        stopStream()
        setCamStatus("error")
      }
    })()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [cameraLive, camAttempt, stopStream])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button className={`h-9 rounded-full bg-ink px-4 text-white hover:bg-ink/90 ${triggerClassName}`}>
          <Camera className="size-4" />
          Add item
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[min(880px,calc(100dvh-24px))] w-[min(calc(100vw-24px),920px)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden rounded-xl border-hairline bg-canvas p-0 text-ink shadow-[var(--shadow-float)] sm:max-w-none"
        showCloseButton={false}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-4 py-4 sm:px-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-semibold tracking-[-0.6px] sm:text-2xl">
              {user ? "Add wardrobe item." : "Sign in to add items."}
            </DialogTitle>
            <DialogDescription className="text-sm text-body">
              {user ? "Capture an image, confirm the details, and save it privately." : "Your wardrobe belongs behind your account before anything is saved."}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="rounded-full border border-hairline p-2 text-body transition hover:bg-canvas-soft" aria-label="Close upload dialog">
            <X className="size-4" />
          </DialogClose>
        </div>

        {!authReady ? (
          <div className="grid min-h-80 place-items-center p-8">
            <Loader2 className="size-5 animate-spin text-body" />
          </div>
        ) : !user ? (
          <div className="grid gap-5 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-6">
            <div className="rounded-lg bg-canvas-soft p-5">
              <div className="flex size-11 items-center justify-center rounded-full bg-ink text-white shadow-[var(--shadow-hairline)]">
                <LockKeyhole className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.6px] text-ink">Private capture starts with sign-in.</h3>
              <p className="mt-2 text-sm leading-6 text-body">
                Photos, tags, outfits, and planner context are stored per account in your private wardrobe.
              </p>
            </div>
            <div className="grid content-center gap-3 rounded-lg border border-hairline bg-canvas p-5">
              {["Save items to Neon Postgres", "Keep uploads tied to your Firebase user", "Return here after signing in"].map((item) => (
                <div className="flex items-center gap-3 text-sm text-body" key={item}>
                  <CheckCircle2 className="size-4 text-ink" />
                  <span>{item}</span>
                </div>
              ))}
              <a className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-white" href={signInHref}>
                Sign in to add item
              </a>
              <DialogClose className="h-10 rounded-full border border-hairline px-4 text-sm font-medium text-ink transition hover:bg-canvas-soft">
                Not now
              </DialogClose>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                <aside className="border-b border-hairline bg-canvas-soft p-4 sm:p-5 lg:border-r lg:border-b-0">
                  <div className="grid gap-2">
                    {captureModes.map((route) => {
                      const Icon = route.icon
                      const isSelected = mode === route.id
                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 py-3 text-left transition hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
                            isSelected ? "border-ink bg-canvas text-ink shadow-[var(--shadow-hairline)]" : "border-hairline bg-canvas-soft text-body"
                          }`}
                          key={route.id}
                          onClick={() => chooseMode(route.id)}
                          type="button"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink shadow-[var(--shadow-hairline)]">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{route.label}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-body">{route.detail}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <input
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      void handleFile(event.target.files?.[0])
                      event.currentTarget.value = ""
                    }}
                    type="file"
                  />
                  <input
                    ref={uploadInputRef}
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      void handleFile(event.target.files?.[0])
                      event.currentTarget.value = ""
                    }}
                    type="file"
                  />

                  <div className="mt-4 rounded-lg border border-hairline bg-canvas p-3 shadow-[var(--shadow-hairline)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs text-body">PREVIEW</p>
                      {previewUrl ? (
                        <button className="text-xs font-medium text-link" onClick={replaceImage} type="button">
                          Replace
                        </button>
                      ) : null}
                    </div>
                    {cameraLive ? (
                      <div className={`${frameClass} relative bg-black`}>
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          aria-label="Live camera preview"
                          className="h-full w-full object-cover"
                          onPlaying={() => setCamStatus("live")}
                        />
                        <span className="sr-only" role="status" aria-live="polite">
                          {camStatus === "starting" ? "Starting camera." : camStatus === "live" ? "Camera ready. Use the capture button to take a photo." : ""}
                        </span>
                        {camStatus === "starting" ? (
                          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
                            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                          </div>
                        ) : null}
                        {camStatus === "error" ? (
                          <div className="absolute inset-0 grid content-center justify-items-center gap-3 bg-canvas-soft p-5 text-center text-sm text-body">
                            <span>Camera unavailable on this device.</span>
                            <div className="flex flex-wrap justify-center gap-2">
                              <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90" onClick={() => chooseMode("upload")} type="button">
                                Upload instead
                              </button>
                              <button className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas-soft" onClick={retryCamera} type="button">
                                Retry
                              </button>
                            </div>
                          </div>
                        ) : camStatus === "live" ? (
                          <button
                            aria-label="Capture photo"
                            className="absolute inset-x-0 bottom-3 mx-auto flex size-14 items-center justify-center rounded-full bg-white shadow-[var(--shadow-float)] ring-4 ring-ink/20 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                            onClick={capturePhoto}
                            type="button"
                          >
                            <span aria-hidden="true" className="size-11 rounded-full bg-ink" />
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        className={`${frameClass} block bg-canvas-soft text-left transition hover:bg-canvas-soft-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link`}
                        onClick={handleFrameClick}
                        type="button"
                      >
                        {previewUrl ? (
                          <img alt="Selected wardrobe item preview" className="h-full w-full object-cover" src={previewUrl} />
                        ) : (
                          <div className="grid h-full place-items-center p-6 text-center text-sm text-body">
                            <div>
                              <ImageIcon className="mx-auto mb-3 size-7 text-mute" />
                              {mode === "camera"
                                ? useNativeCapture
                                  ? "Tap to open camera."
                                  : "Click to start your camera."
                                : mode === "upload"
                                  ? "Tap to choose an image."
                                  : "Paste an image URL below."}
                            </div>
                          </div>
                        )}
                      </button>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {autoTags.map((tag) => (
                        <span className="rounded-full border border-hairline bg-canvas px-2 py-1 text-xs text-body" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-canvas-soft text-body shadow-[var(--shadow-hairline)]">Auto-tag preview</Badge>
                    <Badge className="rounded-full bg-canvas-soft text-body shadow-[var(--shadow-hairline)]">Private by default</Badge>
                    {saved ? (
                      <Badge className="rounded-full bg-[#f5f9ff] text-link shadow-[var(--shadow-hairline)]">
                        <CheckCircle2 className="size-3" />
                        Saved
                      </Badge>
                    ) : null}
                  </div>

                  {mode === "link" ? (
                    <label className={`${labelClass} mb-4`} htmlFor="item-image-url">
                      Image URL
                      <Input
                        className={fieldClass}
                        id="item-image-url"
                        onChange={(event) => updateForm("imageUrl", event.target.value)}
                        placeholder="https://..."
                        type="url"
                        value={form.imageUrl}
                      />
                    </label>
                  ) : null}

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className={labelClass} htmlFor="item-name">
                      Name
                      <Input className={fieldClass} id="item-name" onChange={(event) => updateForm("name", event.target.value)} placeholder="Camel wool blazer" value={form.name} />
                    </label>
                    <label className={labelClass} htmlFor="item-brand">
                      Brand
                      <Input className={fieldClass} id="item-brand" onChange={(event) => updateForm("brand", event.target.value)} placeholder="Unspecified" value={form.brand} />
                    </label>
                    <label className={labelClass} htmlFor="item-type">
                      Type
                      <select className={selectClass} id="item-type" onChange={(event) => updateForm("type", event.target.value)} value={form.type}>
                        {typeOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="item-subcategory">
                      Subcategory
                      <Input className={fieldClass} id="item-subcategory" onChange={(event) => updateForm("subcategory", event.target.value)} placeholder={form.type} value={form.subcategory} />
                    </label>
                    <label className={labelClass} htmlFor="item-color">
                      Color
                      <select className={selectClass} id="item-color" onChange={(event) => updateForm("color", event.target.value)} value={form.color}>
                        {colorOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="item-season">
                      Season
                      <select className={selectClass} id="item-season" onChange={(event) => updateForm("season", event.target.value)} value={form.season}>
                        {seasonOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className={`${labelClass} md:col-span-2`} htmlFor="item-occasion">
                      Occasion
                      <select className={selectClass} id="item-occasion" onChange={(event) => updateForm("occasion", event.target.value)} value={form.occasion}>
                        {occasionOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className={`${labelClass} md:col-span-2`} htmlFor="item-notes">
                      Notes
                      <textarea className="min-h-24 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-mute focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/20" id="item-notes" onChange={(event) => updateForm("notes", event.target.value)} placeholder="Fit, fabric, styling notes..." value={form.notes} />
                    </label>
                  </div>

                  {error ? (
                    <div className="mt-4 flex gap-2 rounded-md border border-[#f7d4d6] bg-[#fff7f8] px-3 py-2 text-sm text-[#c50000]" role="alert">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-hairline bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-body">
                {mode === "camera" ? (useNativeCapture ? "Camera opens on phones and supported browsers." : "Your webcam opens here — allow access, then tap the shutter.") : mode === "upload" ? "Uploads are previewed before saving." : "Use direct image URLs for product references."}
              </p>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button className="h-10 rounded-full border border-hairline bg-canvas px-4 text-sm font-medium text-ink hover:bg-canvas-soft" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button className="h-10 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90" disabled={saving || !canSave} onClick={handleSave} type="button">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Saving" : "Save item"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UploadActions

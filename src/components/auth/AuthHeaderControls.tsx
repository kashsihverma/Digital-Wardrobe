"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { LogIn, LogOut, Menu, Search, UserRound } from "lucide-react"

import UploadActions from "@/components/wardrobe/UploadActions"
import { Button } from "@/components/ui/button"
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase"

type NavItem = {
  href: string
  label: string
}

type Props = {
  active?: string
  nav: NavItem[]
  initialViewerState?: string
}

const publicNav = [
  { href: "/#product-system", label: "Product" },
  { href: "/#privacy", label: "Privacy" },
]

export function AuthHeaderControls({ active = "/", nav, initialViewerState = "none" }: Props) {
  const [ready, setReady] = useState(!hasFirebaseConfig())
  const [user, setUser] = useState<User | null>(null)
  const [viewerState, setViewerState] = useState(initialViewerState)

  useEffect(() => {
    setViewerState(document.documentElement.dataset.dwViewer ?? "none")
  }, [])

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setReady(true)
      return
    }

    let unsubscribe = () => {}
    getFirebaseAuth()
      .then((auth) => {
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser)
          setReady(true)
        })
      })
      .catch(() => setReady(true))

    return () => unsubscribe()
  }, [])

  const clearServerSession = async () => {
    try {
      await fetch("/api/session", { method: "DELETE" })
    } catch {
      // ignore — cookies expire on their own
    }
    try {
      window.sessionStorage.removeItem("dw:session-synced")
    } catch {
      // ignore
    }
  }

  const handleSignOut = async () => {
    await clearServerSession()
    const auth = await getFirebaseAuth()
    await signOut(auth)
    window.dispatchEvent(new CustomEvent("dw:toast", { detail: { message: "Signed out of Digital Wardrobe." } }))
    window.location.assign("/")
  }

  const handleExitGuest = async () => {
    await clearServerSession()
    window.location.assign("/")
  }

  const isGuest = !user && viewerState === "guest"

  if (!ready) {
    return (
      <>
        <div className="hidden h-10 w-[520px] rounded-full border border-hairline bg-canvas-soft lg:block" aria-hidden="true" />
        <div className="h-10 w-24 rounded-full border border-hairline bg-canvas-soft" aria-hidden="true" />
      </>
    )
  }

  const navItems = user || isGuest ? nav : publicNav

  return (
    <>
      <nav className="hidden items-center rounded-full border border-hairline bg-canvas px-1 py-1 text-sm text-body shadow-[var(--shadow-hairline)] lg:flex" aria-label={user ? "Primary navigation" : "Public navigation"}>
        {navItems.map((item) => (
          <a
            className={`rounded-full px-3 py-1.5 transition hover:bg-canvas-soft hover:text-ink ${
              active === item.href ? "bg-ink text-white hover:bg-ink hover:text-white" : ""
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        {user ? (
          <>
            <a className="flex h-9 items-center gap-2 rounded-full border border-hairline bg-canvas px-3 text-sm font-medium text-ink transition hover:bg-canvas-soft" href="/discover">
              <Search className="size-4" />
              Search
            </a>
            <UploadActions />
            <a
              className="hidden h-9 max-w-40 items-center gap-2 rounded-full border border-hairline bg-canvas px-3 text-sm font-medium text-ink shadow-[var(--shadow-hairline)] transition hover:bg-canvas-soft xl:inline-flex"
              href="/settings"
            >
              <UserRound className="size-4 shrink-0" />
              <span className="truncate">{user.displayName || user.email || "Account"}</span>
            </a>
            <Button
              aria-label="Sign out"
              className="size-9 rounded-full border border-hairline bg-canvas p-0 text-ink shadow-[var(--shadow-hairline)] hover:bg-canvas-soft"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut className="size-4" />
            </Button>
          </>
        ) : isGuest ? (
          <>
            <span className="inline-flex h-9 items-center rounded-full border border-hairline bg-canvas-soft px-3 text-xs font-medium text-body">
              Guest mode
            </span>
            <Button
              aria-label="Exit guest mode"
              className="size-9 rounded-full border border-hairline bg-canvas p-0 text-ink shadow-[var(--shadow-hairline)] hover:bg-canvas-soft"
              onClick={handleExitGuest}
              type="button"
            >
              <LogOut className="size-4" />
            </Button>
            <a className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/90" href="/sign-in">
              <LogIn className="size-4" />
              Sign in to save
            </a>
          </>
        ) : (
          <a className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/90" href="/sign-in">
            <LogIn className="size-4" />
            Sign in
          </a>
        )}
      </div>

      <details className="group relative lg:hidden">
        <summary className="flex size-10 list-none items-center justify-center rounded-full border border-hairline bg-canvas text-ink" aria-label="Open menu">
          <Menu className="size-5" />
        </summary>
        <div className="absolute right-0 mt-3 w-[min(calc(100vw-32px),340px)] rounded-lg border border-hairline bg-canvas p-2 shadow-[var(--shadow-float)]">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a className={`rounded-lg px-3 py-2 text-sm text-body ${active === item.href ? "bg-canvas-soft text-ink" : ""}`} href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
            {!user ? (
              <a className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white" href="/sign-in">
                {isGuest ? "Sign in to save" : "Sign in"}
              </a>
            ) : null}
          </nav>
          {user ? (
            <div className="mt-2 grid gap-2 border-t border-hairline pt-2">
              <UploadActions triggerClassName="w-full justify-start rounded-lg bg-canvas px-3 text-ink hover:bg-canvas-soft" />
              <button className="rounded-lg border border-hairline px-3 py-2 text-left text-sm font-medium text-ink" onClick={handleSignOut} type="button">
                Sign out
              </button>
            </div>
          ) : isGuest ? (
            <div className="mt-2 grid gap-2 border-t border-hairline pt-2">
              <button className="rounded-lg border border-hairline px-3 py-2 text-left text-sm font-medium text-ink" onClick={handleExitGuest} type="button">
                Exit guest mode
              </button>
            </div>
          ) : null}
        </div>
      </details>
    </>
  )
}

export default AuthHeaderControls

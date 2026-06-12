"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { LogIn, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase"

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!hasFirebaseConfig())

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

  const handleSignOut = async () => {
    const auth = await getFirebaseAuth()
    await signOut(auth)
    window.dispatchEvent(new CustomEvent("dw:toast", { detail: { message: "Signed out of Digital Wardrobe." } }))
  }

  if (!ready) {
    return <span className="h-9 w-24 rounded-full border border-hairline bg-canvas-soft" aria-hidden="true" />
  }

  if (!user) {
    return (
      <a
        className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/90"
        href="/sign-in"
      >
        <LogIn className="size-4" />
        Sign in
      </a>
    )
  }

  return (
    <div className="flex items-center gap-2">
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
    </div>
  )
}

export default AuthStatus

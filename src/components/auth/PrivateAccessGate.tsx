"use client"

import { useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react"

import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase"

type Props = {
  title?: string
  body?: string
}

export function PrivateAccessGate({
  title = "Sign in to open your wardrobe.",
  body = "Your items, outfits, planner, and insights are private to your account.",
}: Props) {
  const [ready, setReady] = useState(!hasFirebaseConfig())
  const [user, setUser] = useState<User | null>(null)

  const signInHref = useMemo(() => {
    if (typeof window === "undefined") return "/sign-in"
    return `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`
  }, [])

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      document.documentElement.dataset.dwAuth = "signed-out"
      setReady(true)
      return
    }

    let unsubscribe = () => {}

    getFirebaseAuth()
      .then((auth) => {
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser)
          setReady(true)
          document.documentElement.dataset.dwAuth = nextUser ? "signed-in" : "signed-out"
        })
      })
      .catch(() => {
        setReady(true)
        document.documentElement.dataset.dwAuth = "signed-out"
      })

    return () => unsubscribe()
  }, [])

  if (ready && user) return null

  return (
    <div className="fixed inset-x-0 top-16 z-30 min-h-[calc(100vh-4rem)] border-t border-hairline bg-canvas-soft/95 px-4 py-10 backdrop-blur">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-hairline bg-ink p-6 text-white shadow-[var(--shadow-float)]">
          <div className="flex size-11 items-center justify-center rounded-full bg-white text-ink">
            <LockKeyhole className="size-5" />
          </div>
          <p className="mt-8 font-mono text-xs text-white/60">PRIVATE WARDROBE</p>
          <h1 className="mt-3 text-3xl font-semibold leading-10 tracking-[-0.96px]">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-white/70">{body}</p>
        </section>

        <section className="grid content-center gap-4 rounded-lg border border-hairline bg-canvas p-6 shadow-[var(--shadow-card)]">
          {!ready ? (
            <div className="flex items-center gap-3 text-sm text-body">
              <Loader2 className="size-4 animate-spin" />
              Checking your session.
            </div>
          ) : (
            <>
              {["Firebase verifies your identity.", "Neon stores wardrobe data per account.", "Private tools unlock after sign-in."].map((item) => (
                <div className="flex items-center gap-3 text-sm text-body" key={item}>
                  <ShieldCheck className="size-4 text-ink" />
                  <span>{item}</span>
                </div>
              ))}
              <a className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white" href={signInHref}>
                Sign in
                <ArrowRight className="size-4" />
              </a>
              <a className="inline-flex h-10 items-center justify-center rounded-full border border-hairline px-4 text-sm font-medium text-ink transition hover:bg-canvas-soft" href="/">
                Back to overview
              </a>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default PrivateAccessGate

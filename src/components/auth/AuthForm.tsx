"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth"
import { ArrowRight, Eye, EyeOff, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFirebaseAuth, googleProvider, hasFirebaseConfig } from "@/lib/firebase"

type AuthMode = "sign-in" | "create"

function getFriendlyAuthError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""

  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
    return "That email and password combination does not match an account."
  }

  if (code.includes("auth/email-already-in-use")) {
    return "An account already exists for this email. Try signing in instead."
  }

  if (code.includes("auth/popup-closed-by-user")) {
    return "Google sign-in was closed before it finished."
  }

  if (code.includes("auth/weak-password")) {
    return "Use at least 6 characters for your password."
  }

  return "Sign-in could not be completed. Check the details and try again."
}

function getRedirectTarget() {
  if (typeof window === "undefined") return "/wardrobe"

  const target = new URLSearchParams(window.location.search).get("redirect")
  return target?.startsWith("/") ? target : "/wardrobe"
}

export function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<"idle" | "loading">("idle")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const isConfigured = hasFirebaseConfig()
  const redirectTarget = useMemo(getRedirectTarget, [])

  useEffect(() => {
    if (!isConfigured) return

    let unsubscribe = () => {}

    getFirebaseAuth()
      .then((auth) => {
        unsubscribe = onAuthStateChanged(auth, setUser)
      })
      .catch(() => {
        setError("Firebase is not configured correctly.")
      })

    return () => unsubscribe()
  }, [isConfigured])

  const completeSignIn = async (nextUser: User) => {
    setUser(nextUser)
    const token = await nextUser.getIdToken()
    await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setMessage("Signed in. Opening your wardrobe.")
    window.setTimeout(() => {
      window.location.assign(redirectTarget)
    }, 500)
  }

  const handleGoogleSignIn = async () => {
    setStatus("loading")
    setError("")
    setMessage("")

    try {
      const auth = await getFirebaseAuth()
      const result = await signInWithPopup(auth, googleProvider)
      await completeSignIn(result.user)
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError))
    } finally {
      setStatus("idle")
    }
  }

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("loading")
    setError("")
    setMessage("")

    try {
      const auth = await getFirebaseAuth()
      const credential =
        authMode === "create"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password)

      if (authMode === "create" && name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() })
      }

      await completeSignIn(credential.user)
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError))
    } finally {
      setStatus("idle")
    }
  }

  const isBusy = status === "loading"
  const title = authMode === "create" ? "Create your wardrobe account." : "Sign in to Digital Wardrobe."

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-hairline bg-canvas-soft p-5 text-sm leading-6 text-body">
        <p className="font-medium text-ink">Firebase needs configuration before sign-in can run.</p>
        <p className="mt-2">
          Add the values from your Firebase web app to <span className="font-mono text-xs">.env</span>, using{" "}
          <span className="font-mono text-xs">.env.example</span> as the template. Enable Google and Email/Password
          providers in Firebase Authentication.
        </p>
      </div>
    )
  }

  if (user) {
    return (
      <div className="rounded-lg border border-hairline bg-canvas-soft p-5">
        <p className="text-sm font-medium text-ink">You are signed in.</p>
        <p className="mt-1 text-sm text-body">{user.email ?? "Your session is ready."}</p>
        <a
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white"
          href={redirectTarget}
        >
          Open wardrobe
          <ArrowRight className="size-4" />
        </a>
      </div>
    )
  }

  return (
    <div>
      <div>
        <p className="font-mono text-xs text-body">PRIVATE ACCESS</p>
        <h1 className="mt-3 text-3xl font-semibold leading-10 tracking-[-0.96px] text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          Keep closet photos, outfit plans, and share links behind your own account.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <Button
          className="h-12 rounded-full border border-hairline bg-canvas text-sm font-medium text-ink shadow-[var(--shadow-hairline)] hover:bg-canvas-soft"
          disabled={isBusy}
          onClick={handleGoogleSignIn}
          type="button"
        >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : <span className="text-base font-semibold">G</span>}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-hairline" />
          <span className="font-mono text-xs text-mute">OR</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <form className="grid gap-3" onSubmit={handleEmailSubmit}>
          {authMode === "create" ? (
            <label className="grid gap-1.5 text-sm text-body">
              Name
              <Input
                autoComplete="name"
                className="h-11 rounded-md border-hairline bg-canvas text-sm"
                onChange={(event) => setName(event.target.value)}
                placeholder="Kashish Verma"
                value={name}
              />
            </label>
          ) : null}

          <label className="grid gap-1.5 text-sm text-body">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
              <Input
                autoComplete="email"
                className="h-11 rounded-md border-hairline bg-canvas pl-10 text-sm"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm text-body">
            Password
            <span className="relative">
              <Input
                autoComplete={authMode === "create" ? "new-password" : "current-password"}
                className="h-11 rounded-md border-hairline bg-canvas pr-10 text-sm"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-body transition hover:bg-canvas-soft"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>

          {error ? (
            <p className="rounded-md border border-[#f7d4d6] bg-[#fff7f8] px-3 py-2 text-sm text-[#c50000]" role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-md border border-[#d3e5ff] bg-[#f5f9ff] px-3 py-2 text-sm text-link" role="status">
              {message}
            </p>
          ) : null}

          <Button className="mt-1 h-11 rounded-full bg-ink text-sm font-medium text-white hover:bg-ink/90" disabled={isBusy}>
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
            {authMode === "create" ? "Create account" : "Sign in with email"}
          </Button>
        </form>

        <button
          className="justify-self-center rounded-full px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas-soft"
          onClick={() => {
            setAuthMode((current) => (current === "sign-in" ? "create" : "sign-in"))
            setError("")
            setMessage("")
          }}
          type="button"
        >
          {authMode === "create" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  )
}

export default AuthForm

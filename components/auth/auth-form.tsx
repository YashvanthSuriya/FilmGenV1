"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "sign-in" | "sign-up" | "forgot"

interface AuthFormProps {
  mode?: AuthMode
}

export function AuthForm({ mode = "sign-in" }: AuthFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    try {
      if (mode === "sign-up" && password !== confirmPassword) {
        throw new Error("Passwords do not match.")
      }

      const supabase = createClient()

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
        if (resetError) throw resetError
        setMessage("Check your email for reset instructions.")
      } else if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        setMessage("Account created. Opening your studio.")
        router.push("/studio?tab=storyboard")
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setMessage("Signed in. Opening your studio.")
        router.push("/studio?tab=storyboard")
      }
    } catch (authError) {
      if (authError instanceof Error && authError.message.includes("Supabase is not configured") && mode !== "forgot") {
        setMessage("Local studio session ready.")
        router.push("/studio?tab=storyboard")
        return
      }
      setError(authError instanceof Error ? authError.message : "Authentication is unavailable right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mode === "sign-up" ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your director name" autoComplete="name" />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="director@studio.com" autoComplete="email" required />
      </div>

      {mode !== "forgot" ? (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-primary"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : null}

      {mode === "sign-up" ? (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" />
          <div className="flex gap-2 pt-1">
            {["Free", "Creator", "Filmmaker", "Director"].map((plan) => (
              <span
                key={plan}
                className="rounded-full border border-border px-3 py-1 font-heading text-xs uppercase tracking-[0.08em] text-text-muted first:border-accent-cyan first:bg-accent-cyan-dim first:text-accent-cyan"
              >
                {plan}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="rounded-md border border-accent-red/30 bg-accent-red-dim px-3 py-2 text-sm text-accent-red">{error}</p> : null}
      {message ? (
        <p className="flex items-center gap-2 rounded-md border border-accent-green/30 bg-accent-green-dim px-3 py-2 text-sm text-accent-green">
          <Check className="h-4 w-4" />
          {message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {mode === "sign-up" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
      </Button>

      {mode !== "forgot" ? (
        <>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="h-px flex-1 bg-border-subtle" />
            or
            <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <Button type="button" className="w-full bg-white text-black hover:bg-white/90" disabled>
            Continue with Google
          </Button>
        </>
      ) : null}

      <p className="text-center text-sm text-text-secondary">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-accent-cyan hover:underline">
              Create one free
            </Link>
          </>
        ) : (
          <Link href="/" className="text-accent-cyan hover:underline">
            Back to sign in
          </Link>
        )}
      </p>
    </form>
  )
}

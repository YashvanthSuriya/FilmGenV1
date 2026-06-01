"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthMode = "sign-in" | "sign-up" | "forgot"

interface AuthFormProps {
  mode?: AuthMode
}

export function AuthForm({ mode = "sign-in" }: AuthFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (!email.includes("@")) {
      setError("Enter an email-shaped value to open the demo.")
      return
    }
    if (mode === "forgot") {
      setMessage("Password recovery is not connected in this UI demo.")
      return
    }
    if (!password.trim()) {
      setError("Enter any password value to preview the studio.")
      return
    }
    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setMessage("Opening the frontend demo.")
    router.push("/studio?tab=storyboard")
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
            {["Story", "Workspace", "Edit", "Review"].map((plan) => (
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

      <Button type="submit" variant="primary" size="lg" className="w-full">
        {mode === "sign-up" ? "Open Demo Studio" : mode === "forgot" ? "Preview Recovery State" : "Enter Demo Studio"}
      </Button>

      {mode !== "forgot" ? (
        <>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="h-px flex-1 bg-border-subtle" />
            or
            <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <Button type="button" className="w-full bg-white text-black hover:bg-white/90" onClick={() => router.push("/studio?tab=storyboard")}>
            Continue to Demo
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

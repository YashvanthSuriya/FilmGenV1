import Link from "next/link"

interface ClerkPlaceholderProps {
  mode: "sign-in" | "sign-up"
  allowDemo?: boolean
}

export function ClerkPlaceholder({ mode, allowDemo = false }: ClerkPlaceholderProps) {
  const action = mode === "sign-in" ? "Sign in" : "Create account"

  return (
    <div className="space-y-5 rounded-[var(--radius-lg)] bg-background p-6 text-center">
      <div>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan">
          Local auth setup
        </p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-text-primary">
          Clerk is not configured
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {action} is disabled because this local app is using placeholder Clerk keys. Add real
          `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` values to `.env.local`, then
          restart the dev server.
        </p>
      </div>

      <div className="rounded border border-border-subtle bg-surface p-3 text-left font-mono text-xs text-text-secondary">
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
        <p>CLERK_SECRET_KEY=sk_test_...</p>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {allowDemo ? (
          <Link
            href="/studio?tab=storyboard"
            className="rounded-full bg-accent-cyan px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent-cyan/90"
          >
            Continue to Studio
          </Link>
        ) : null}
        <Link
          href="/"
          className="rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-cyan hover:text-accent-cyan"
        >
          Back home
        </Link>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ArrowRight, Clapperboard, Film, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const pillars = [
  { label: "Storyboard", icon: Clapperboard },
  { label: "Workspace", icon: Sparkles },
  { label: "Editing", icon: Film }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5">
        <header className="flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/sign-up">Start</Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">
              FilmGen Studio
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl font-bold leading-tight text-text-primary sm:text-6xl">
              AI film creation from story cards to final edit.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-text-secondary">
              Plan shots, arrange creative direction, and stage the final edit from one protected studio shell.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/sign-up">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <div className="grid gap-3">
              {pillars.map(({ label, icon: Icon }, index) => (
                <div key={label} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-4">
                  <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-accent-cyan-dim text-accent-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Step {index + 1}
                    </p>
                    <p className="font-heading text-lg font-semibold text-text-primary">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}

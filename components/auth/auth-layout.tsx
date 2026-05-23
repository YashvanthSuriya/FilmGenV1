import { BrandLogo } from "@/components/brand-logo"
import { Card } from "@/components/ui/card"

export function AuthLayout({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[40%_60%]">
      <section className="flex min-h-screen flex-col justify-center px-6 py-8 sm:px-10 lg:px-14">
        <div className="mb-12">
          <BrandLogo />
          <p className="mt-2 text-sm text-text-secondary">Hollywood in a Browser</p>
        </div>

        <div className="max-w-md">
          <h1 className="font-heading text-2xl font-bold text-text-primary">{title}</h1>
          <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-5 text-xs text-text-muted">By signing in, you agree to our Terms & Privacy Policy.</p>
        </div>
      </section>

      <section className="studio-mesh relative min-h-[420px] overflow-hidden lg:min-h-screen">
        <div className="absolute inset-0 animate-mesh-drift opacity-80" />
        <div className="relative grid h-full grid-cols-3 gap-4 p-8 lg:p-12">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card
              key={index}
              className="min-h-32 border-white/10 bg-black/30 shadow-[inset_0_0_35px_rgba(255,255,255,0.04)] backdrop-blur"
              style={{ transform: `translateY(${(index % 3) * 16}px)` }}
            >
              <div className="h-full rounded-[var(--radius-lg)] bg-gradient-to-br from-accent-cyan-dim via-transparent to-accent-amber-dim" />
            </Card>
          ))}
        </div>
        <p className="absolute bottom-8 left-8 font-heading text-sm uppercase tracking-[0.08em] text-text-primary">
          5,000+ filmmakers. 120,000+ scenes generated.
        </p>
      </section>
    </main>
  )
}

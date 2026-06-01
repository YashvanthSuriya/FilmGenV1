import { Bell, MonitorCog, Palette, User } from "lucide-react"
import { StudioTopNav } from "@/components/studio/studio-top-nav"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const sections = [
  { label: "Account", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Demo Defaults", icon: MonitorCog },
  { label: "Appearance", icon: Palette }
]

export default function StudioSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudioTopNav />
      <main className="grid min-h-[calc(100vh-var(--nav-height))] grid-cols-1 md:grid-cols-[var(--settings-sidebar-width)_1fr]">
        <aside className="border-b border-border-subtle bg-surface p-3 md:border-b-0 md:border-r">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {sections.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                type="button"
                className={`flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left font-heading text-xs font-semibold uppercase tracking-[0.08em] transition ${
                  index === 0
                    ? "bg-accent-cyan-dim text-accent-cyan"
                    : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="p-4 sm:p-6">
          <div className="max-w-4xl">
            <h1 className="font-heading text-3xl font-bold text-text-primary">Settings</h1>
            <p className="mt-2 text-text-secondary">Frontend-only account and presentation preferences for the demo.</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
              <Card className="p-5">
                <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
                  Account
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" defaultValue="Director" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="director@studio.com" />
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="p-4">
                  <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
                    Demo Build
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">No backend, subscriptions, credits, API keys, or cloud services are connected.</p>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

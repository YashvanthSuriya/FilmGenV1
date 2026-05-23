"use client"

import { useEffect } from "react"
import { Camera, Clapperboard, Film, Grid3X3, Wand2 } from "lucide-react"
import { StudioTopNav } from "@/components/studio/studio-top-nav"
import { StoryboardWorkspace } from "@/components/storyboard/storyboard-workspace"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PlanLockOverlay } from "@/components/ui/plan-lock-overlay"
import { studioTabs, type StudioTab } from "@/lib/types"
import { useProjectStore } from "@/lib/stores/project"

const panelContent: Record<
  StudioTab,
  {
    label: string
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    items: string[]
  }
> = {
  storyboard: {
    label: "Storyboard",
    title: "Pre-production board",
    description: "Style cards, characters, and frame planning will land here in Phase 2.",
    icon: Grid3X3,
    items: ["Frame grid placeholder", "Library sidebar reserved", "Generate board action locked"]
  },
  workspace: {
    label: "Cinema Workspace",
    title: "Node canvas foundation",
    description: "The React Flow workspace, custom nodes, and cyan pulse edges arrive in Phase 3.",
    icon: Wand2,
    items: ["56px toolbar reserved", "320px properties panel reserved", "Execution model deferred"]
  },
  editing: {
    label: "Editing",
    title: "Timeline editing suite",
    description: "Timeline tracks, clip controls, audio, and color tools arrive in Phase 4.",
    icon: Film,
    items: ["180px track header reserved", "Playhead model deferred", "WebCodecs export deferred"]
  },
  export: {
    label: "Export",
    title: "Export and submission hub",
    description: "Browser export, cloud export gating, and challenge submission arrive in later phases.",
    icon: Clapperboard,
    items: ["720p free-tier target", "Clapperboard progress deferred", "Distribution hub placeholder"]
  }
}

export function StudioShell({ initialTab }: { initialTab: StudioTab }) {
  const setActiveTab = useProjectStore((state) => state.setActiveTab)
  const activeTab = studioTabs.includes(initialTab) ? initialTab : "storyboard"
  const content = panelContent[activeTab]
  const Icon = content.icon

  useEffect(() => {
    setActiveTab(activeTab)
  }, [activeTab, setActiveTab])

  if (activeTab === "storyboard") {
    return (
      <div className="min-h-screen bg-background">
        <StudioTopNav activeTab={activeTab} />
        <StoryboardWorkspace />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StudioTopNav activeTab={activeTab} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge>{content.label}</Badge>
            <h1 className="mt-3 font-heading text-3xl font-bold text-text-primary">{content.title}</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">{content.description}</p>
          </div>
          <div className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-xs uppercase tracking-[0.08em] text-text-muted">
            Phase 1 Foundation
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="min-h-[520px] overflow-hidden">
            <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
              <div className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-secondary">
                <Icon className="h-4 w-4 text-accent-cyan" />
                {content.label}
              </div>
              <Camera className="h-4 w-4 text-text-muted" />
            </div>
            <div className="grid min-h-[464px] place-items-center p-6">
              <div className="max-w-lg text-center">
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[var(--radius-xl)] border border-accent-cyan bg-accent-cyan-dim">
                  <Icon className="h-9 w-9 text-accent-cyan" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-text-primary">{content.title}</h2>
                <p className="mt-3 text-text-secondary">{content.description}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {content.items.map((item) => (
                    <div key={item} className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3 text-sm text-text-secondary">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
                Project Context
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Plan</dt>
                  <dd className="text-text-primary">Free</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Credits</dt>
                  <dd className="text-accent-amber">50</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Active tab</dt>
                  <dd className="text-accent-cyan">{activeTab}</dd>
                </div>
              </dl>
            </Card>
            <PlanLockOverlay />
          </aside>
        </section>
      </main>
    </div>
  )
}

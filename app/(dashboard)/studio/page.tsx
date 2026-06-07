"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Clapperboard } from "lucide-react"
import { ChallengesTab } from "@/components/challenges/ChallengesTab"
import { StoryboardWorkspace } from "@/components/cards/storyboard/storyboard-workspace"
import { FreeCutFrame } from "@/components/editor/FreeCutFrame"
import { GalleryTab } from "@/components/gallery/GalleryTab"
import { Card } from "@/components/ui/card"
import { StudioErrorBoundary } from "@/components/ui/studio-error-boundary"
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas"
import { studioTabs, type StudioTab } from "@/lib/types"
import { useProjectStore } from "@/lib/stores/project"

function resolveTab(tab: string | null): StudioTab {
  return studioTabs.includes(tab as StudioTab) ? (tab as StudioTab) : "storyboard"
}

function ExportPlaceholder({ activeTab }: { activeTab: StudioTab }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan">
          Export
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-text-primary">Export and review</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Studio-level export remains a backend contract placeholder. FreeCut export tools are available inside the editing tab after editor setup.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="grid min-h-[520px] place-items-center p-6 text-center">
          <div className="max-w-lg">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[var(--radius-xl)] border border-accent-cyan bg-accent-cyan-dim">
              <Clapperboard className="h-9 w-9 text-accent-cyan" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary">No studio export job yet</h2>
            <p className="mt-3 text-text-secondary">
              API stubs will expose the export contract in the backend phase. This view intentionally does not fake a render pipeline.
            </p>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
              Project Context
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Mode</dt>
                <dd className="text-text-primary">Frontend stub</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Active tab</dt>
                <dd className="text-accent-cyan">{activeTab}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </section>
    </main>
  )
}

function StudioBootSurface() {
  return (
    <main className="grid min-h-[calc(100vh-var(--nav-height))] place-items-center bg-background p-6">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-5 text-center shadow-lg">
        <div className="mx-auto mb-4 h-2 w-32 overflow-hidden rounded-full bg-elevated">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent-cyan" />
        </div>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan">
          Loading Studio
        </p>
        <p className="mt-2 text-sm text-text-muted">Restoring local project memory.</p>
      </div>
    </main>
  )
}

export default function StudioPage() {
  const searchParams = useSearchParams()
  const activeTab = resolveTab(searchParams.get("tab"))
  const setActiveTab = useProjectStore((state) => state.setActiveTab)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setActiveTab(activeTab)
  }, [activeTab, setActiveTab])

  if (!mounted) {
    return <StudioBootSurface />
  }

  if (activeTab === "storyboard") {
    return (
      <StudioErrorBoundary>
        <StoryboardWorkspace />
      </StudioErrorBoundary>
    )
  }

  if (activeTab === "workspace") {
    return (
      <StudioErrorBoundary>
        <WorkspaceCanvas />
      </StudioErrorBoundary>
    )
  }

  if (activeTab === "editing") {
    return (
      <StudioErrorBoundary>
        <FreeCutFrame />
      </StudioErrorBoundary>
    )
  }

  if (activeTab === "gallery") {
    return (
      <StudioErrorBoundary>
        <GalleryTab />
      </StudioErrorBoundary>
    )
  }

  if (activeTab === "challenges") {
    return (
      <StudioErrorBoundary>
        <ChallengesTab />
      </StudioErrorBoundary>
    )
  }

  return <ExportPlaceholder activeTab={activeTab} />
}

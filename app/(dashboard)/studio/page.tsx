"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChallengesTab } from "@/components/challenges/ChallengesTab"
import { StoryboardWorkspace } from "@/components/cards/storyboard/storyboard-workspace"
import { EditorPlaceholder } from "@/components/editor/EditorPlaceholder"
import { GalleryTab } from "@/components/gallery/GalleryTab"
import { StudioErrorBoundary } from "@/components/ui/studio-error-boundary"
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas"
import { studioTabs, type StudioTab } from "@/lib/types"
import { useProjectStore } from "@/lib/stores/project"

function resolveTab(tab: string | null): StudioTab {
  return studioTabs.includes(tab as StudioTab) ? (tab as StudioTab) : "storyboard"
}

export default function StudioPage() {
  const searchParams = useSearchParams()
  const activeTab = resolveTab(searchParams.get("tab"))
  const setActiveTab = useProjectStore((state) => state.setActiveTab)

  useEffect(() => {
    setActiveTab(activeTab)
  }, [activeTab, setActiveTab])

  // Use the activeTab as the React `key` so React unmounts the old tab and mounts
  // the new one. The CSS animation on the wrapper triggers on each mount → smooth fade-in.
  let content: React.ReactNode = null
  if (activeTab === "storyboard") {
    content = (
      <StudioErrorBoundary>
        <StoryboardWorkspace />
      </StudioErrorBoundary>
    )
  } else if (activeTab === "workspace") {
    content = (
      <StudioErrorBoundary>
        <WorkspaceCanvas />
      </StudioErrorBoundary>
    )
  } else if (activeTab === "editing") {
    content = (
      <StudioErrorBoundary>
        <EditorPlaceholder />
      </StudioErrorBoundary>
    )
  } else if (activeTab === "gallery") {
    content = (
      <StudioErrorBoundary>
        <GalleryTab />
      </StudioErrorBoundary>
    )
  } else if (activeTab === "challenges") {
    content = (
      <StudioErrorBoundary>
        <ChallengesTab />
      </StudioErrorBoundary>
    )
  }

  return (
    <div key={activeTab} className="studio-tab-transition">
      {content}
    </div>
  )
}

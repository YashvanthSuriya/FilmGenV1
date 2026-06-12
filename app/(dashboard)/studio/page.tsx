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
        <EditorPlaceholder />
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

  return null
}

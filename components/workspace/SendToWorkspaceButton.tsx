"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Layers, Sparkles } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useStoryboardStore, type StoryboardProjectState } from "@/lib/stores/storyboard"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { StoryboardImportWizard } from "@/components/workspace/StoryboardImportWizard"
import type { GenerationResult } from "@/lib/types"

interface SendToWorkspaceButtonProps {
  /** When provided, only these generations are sent. Otherwise all generations in the project are sent. */
  generations?: GenerationResult[]
  /** When provided, overrides the variant label shown to the user. */
  label?: string
  /** Compact variant for inline use. */
  compact?: boolean
  /** Style: "primary" uses cyan filled; "ghost" uses bordered. */
  variant?: "primary" | "ghost"
}

/**
 * "Send to Workspace" button — opens a picker wizard so the user explicitly chooses
 * which frames to send and which style/character/action to attach. Nothing is auto-attached;
 * if the user picks nothing, the workspace graph has only Prompt + Camera + Image Output per shot
 * (no style/character nodes), and they can add those manually in the workspace.
 */
export function SendToWorkspaceButton({
  generations,
  label = "Send to Workspace",
  compact = false,
  variant = "primary"
}: SendToWorkspaceButtonProps) {
  const router = useRouter()
  const projectId = useProjectStore((state) => state.activeProjectId)
  const projectState = useStoryboardStore((state) => state.projects[projectId]) as StoryboardProjectState | undefined
  const [wizardOpen, setWizardOpen] = useState(false)

  const allGenerations = generations ?? projectState?.generations ?? []
  const disabled = allGenerations.length === 0

  function handleClick() {
    if (disabled) return
    setWizardOpen(true)
  }

  const baseClass = variant === "primary"
    ? "inline-flex items-center gap-1.5 rounded-(--radius-md) bg-accent-cyan px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
    : "inline-flex items-center gap-1.5 rounded-(--radius-md) border border-accent-cyan/40 px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-cyan transition hover:bg-accent-cyan-dim disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={baseClass}
        title={disabled ? "Generate at least one frame in Storyboard first" : `Pick frames and style, then build a workspace graph from ${allGenerations.length} generation${allGenerations.length === 1 ? "" : "s"}`}
      >
        <Layers className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {label}
        {!compact ? <ArrowRight className="h-3 w-3" /> : null}
      </button>
      <StoryboardImportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}

"use client"

import type { LucideIcon } from "lucide-react"
import { Camera, Combine, Image, MessageSquareText, MonitorPlay, Palette, ScrollText, UserRound, Video } from "lucide-react"
import type { WorkspaceNodeType } from "@/lib/types"
import { cn } from "@/lib/utils"

export const workspaceTools: Array<{ type: WorkspaceNodeType; label: string; icon: LucideIcon }> = [
  { type: "styleCard", label: "Style Card", icon: Palette },
  { type: "character", label: "Character", icon: UserRound },
  { type: "prompt", label: "Prompt", icon: MessageSquareText },
  { type: "cameraConfig", label: "Camera", icon: Camera },
  { type: "imageOutput", label: "Image", icon: Image },
  { type: "videoOutput", label: "Video", icon: Video },
  { type: "combiner", label: "Combiner", icon: Combine },
  { type: "script", label: "Script", icon: ScrollText },
  { type: "preview", label: "Preview", icon: MonitorPlay }
]

export function NodePalette({ onAddNode, className }: { onAddNode: (type: WorkspaceNodeType) => void; className?: string }) {
  return (
    <aside className={cn("z-20 flex w-[172px] shrink-0 flex-col gap-2 border-r border-border-subtle bg-surface px-2 py-3 max-md:w-[76px] max-md:items-center max-md:px-1", className)}>
      <div className="px-2 pb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Nodes
      </div>
      {workspaceTools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.type}
            type="button"
            onClick={() => onAddNode(tool.type)}
            className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-md)] px-2 text-left text-text-secondary transition hover:bg-elevated hover:text-accent-cyan max-md:h-12 max-md:w-[68px] max-md:flex-col max-md:justify-center max-md:gap-1 max-md:px-1"
            title={tool.label}
            aria-label={`Add ${tool.label} node`}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate text-sm max-md:max-w-[62px] max-md:text-[9px] max-md:leading-none">{tool.label}</span>
          </button>
        )
      })}
    </aside>
  )
}

"use client"

import type { NodeProps } from "@xyflow/react"
import { MessageSquareText } from "lucide-react"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function PromptNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  return (
    <BaseNode id={id} icon={MessageSquareText} label="Prompt" selected={selected} status={data.status}>
      <textarea
        value={data.prompt ?? ""}
        onChange={(event) => updateNode(id, { prompt: event.target.value })}
        placeholder="Describe the shot..."
        className="min-h-20 w-full resize-none rounded-[var(--radius-sm)] border border-border bg-background p-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
      />
    </BaseNode>
  )
}

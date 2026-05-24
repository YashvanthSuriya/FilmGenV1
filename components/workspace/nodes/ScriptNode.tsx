"use client"

import type { NodeProps } from "@xyflow/react"
import { ScrollText } from "lucide-react"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function ScriptNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  return (
    <BaseNode id={id} icon={ScrollText} label="Script" selected={selected} status={data.status}>
      <textarea
        value={data.script ?? ""}
        onChange={(event) => updateNode(id, { script: event.target.value })}
        placeholder="Scene beats or dialogue..."
        className="min-h-20 w-full resize-none rounded-[var(--radius-sm)] border border-border bg-background p-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
      />
    </BaseNode>
  )
}

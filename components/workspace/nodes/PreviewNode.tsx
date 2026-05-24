"use client"

import type { NodeProps } from "@xyflow/react"
import { MonitorPlay } from "lucide-react"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function PreviewNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  return (
    <BaseNode id={id} icon={MonitorPlay} label="Preview" selected={selected} status={data.status}>
      <div className="grid aspect-video place-items-center rounded border border-border bg-background text-xs text-text-muted">
        {data.output ?? "Connected outputs preview here"}
      </div>
    </BaseNode>
  )
}

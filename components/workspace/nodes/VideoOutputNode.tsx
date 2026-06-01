"use client"

import type { NodeProps } from "@xyflow/react"
import { Video } from "lucide-react"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function VideoOutputNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  return (
    <BaseNode id={id} icon={Video} label="Video Output" selected={selected} status={data.status} footer={<span>Demo</span>}>
      <div className="grid aspect-video place-items-center rounded border border-dashed border-border bg-background text-xs text-text-muted">
        {data.output ?? "Static video output preview"}
      </div>
    </BaseNode>
  )
}

"use client"

import type { NodeProps } from "@xyflow/react"
import { Image } from "lucide-react"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function ImageOutputNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  return (
    <BaseNode id={id} icon={Image} label="Image Output" selected={selected} status={data.status} footer={<span>Demo</span>}>
      <div className="grid aspect-video place-items-center rounded border border-dashed border-border bg-background text-xs text-text-muted">
        {data.output ?? "Static image output preview"}
      </div>
    </BaseNode>
  )
}

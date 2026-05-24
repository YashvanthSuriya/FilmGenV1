"use client"

import type { NodeProps } from "@xyflow/react"
import { Image, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function ImageOutputNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const publishWorkspaceAsset = useProjectStore((state) => state.publishWorkspaceAsset)
  const publish = () => publishWorkspaceAsset({ id, type: "imageOutput", position: { x: 0, y: 0 }, data })

  return (
    <BaseNode id={id} icon={Image} label="Image Output" selected={selected} status={data.status} footer={<span>Mock</span>}>
      <div className="grid aspect-video place-items-center rounded border border-dashed border-border bg-background text-xs text-text-muted">
        {data.output ?? "Image preview placeholder"}
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="nodrag nopan w-full"
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => {
          event.stopPropagation()
          publish()
        }}
        onClick={(event) => {
          event.stopPropagation()
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") publish()
        }}
      >
        <Send className="h-4 w-4" />
        Send to Editing
      </Button>
    </BaseNode>
  )
}

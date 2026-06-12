"use client"

import type { NodeProps } from "@xyflow/react"
import { Combine } from "lucide-react"
import { useMemo } from "react"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { getUpstreamNodes } from "@/lib/workspace/workflowRun"
import { BaseNode } from "./BaseNode"

export function CombinerNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const upstreamCount = useMemo(() => getUpstreamNodes(id, nodes, edges).length, [edges, id, nodes])

  return (
    <BaseNode id={id} icon={Combine} label="Shot Builder" selected={selected} status={data.status} footer={<span>{upstreamCount} inputs</span>}>
      <div className="space-y-2 text-xs">
        <p>Merge upstream style, character, script, prompt, and camera intent before sending it to an image or video output.</p>
        <p className="rounded border border-border-subtle bg-background p-2 text-text-muted">
          Connect this node to an output when multiple creative inputs need to travel together.
        </p>
      </div>
    </BaseNode>
  )
}

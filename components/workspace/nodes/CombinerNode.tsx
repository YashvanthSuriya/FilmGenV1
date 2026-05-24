"use client"

import type { NodeProps } from "@xyflow/react"
import { Combine } from "lucide-react"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"

export function CombinerNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  return (
    <BaseNode id={id} icon={Combine} label="Combiner" selected={selected} status={data.status}>
      <p className="text-xs">Merges upstream style, character, prompt, and camera signals into one local assembly.</p>
    </BaseNode>
  )
}

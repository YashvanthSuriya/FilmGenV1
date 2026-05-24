"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { runWorkspaceMock, WorkspaceCycleError } from "@/lib/workspace/execution"

export function RunAllButton() {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const setNodes = useWorkspaceStore((state) => state.setNodes)
  const setEdges = useWorkspaceStore((state) => state.setEdges)

  function run() {
    try {
      const result = runWorkspaceMock(nodes, edges)
      setNodes(result.nodes)
      setEdges(result.edges)
    } catch (error) {
      const message = error instanceof WorkspaceCycleError ? "Cycle detected" : "Run failed"
      setNodes(nodes.map((node) => ({ ...node, data: { ...node.data, status: "error", output: message } })))
    }
  }

  return (
    <Button type="button" variant="primary" size="sm" onClick={run} disabled={nodes.length === 0}>
      <Play className="h-4 w-4" />
      Run All
    </Button>
  )
}

"use client"

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react"
import type { WorkspaceEdge } from "@/lib/types"

export function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data
}: EdgeProps<WorkspaceEdge>) {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const generating = data?.status === "generating"

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke: "rgba(0, 229, 255, 0.35)", strokeWidth: 2 }} />
      {generating ? (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: "#00E5FF",
            strokeWidth: 2,
            strokeDasharray: "8 10",
            animation: "workspace-edge-pulse 0.9s linear infinite"
          }}
        />
      ) : null}
    </>
  )
}

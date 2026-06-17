"use client"

import { BaseEdge, getBezierPath, getSmoothStepPath, type EdgeProps } from "@xyflow/react"
import type { WorkspaceEdge } from "@/lib/types"

export type EdgePathStyle = "bezier" | "smoothstep"

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
  const pathStyle: EdgePathStyle = (data?.pathStyle as EdgePathStyle) ?? "bezier"
  const [edgePath] =
    pathStyle === "smoothstep"
      ? getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12 })
      : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
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

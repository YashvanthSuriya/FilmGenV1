"use client"

import type { NodeProps } from "@xyflow/react"
import { SlidersHorizontal } from "lucide-react"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { CameraConfig, WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"
import { CameraConfigGrid, normalizeCamera } from "./CameraConfigGrid"

export function CameraConfigNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const camera = normalizeCamera(data.camera)

  function updateCamera(value: Partial<CameraConfig>) {
    updateNode(id, { camera: { ...camera, ...value } })
  }

  const selectedBodyLabel = camera.body ?? "Full-frame Cine"
  const footerLabel = `${selectedBodyLabel} · ${camera.focalLength}mm · ${camera.movement}`

  return (
    <BaseNode
      icon={SlidersHorizontal}
      id={id}
      label="Camera Config"
      selected={selected}
      status={data.status}
      className="max-h-[560px] w-[620px] max-w-[80vw]"
      bodyClassName="camera-option-scroll max-h-[480px] overflow-y-auto p-4"
      footer={<span>{footerLabel}</span>}
      nodeType="cameraConfig"
    >
      <CameraConfigGrid camera={camera} onChange={(next) => updateNode(id, { camera: next })} />
    </BaseNode>
  )
}

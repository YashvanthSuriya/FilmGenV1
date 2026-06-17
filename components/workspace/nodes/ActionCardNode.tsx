"use client"

import type { NodeProps } from "@xyflow/react"
import { Zap } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"
import { NodeImageUploader } from "./NodeImageUploader"

export function ActionCardNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const actionCards = useProjectStore((state) => state.actionCards)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const card = actionCards.find((item) => item.id === data.actionCardId) ?? actionCards[0]

  const attachedIds = data.attachedImageIds ?? []

  function attachImage(assetId: string) {
    const next = attachedIds.includes(assetId) ? attachedIds : [...attachedIds, assetId]
    updateNode(id, { attachedImageIds: next })
  }

  function removeImage(assetId: string) {
    updateNode(id, { attachedImageIds: attachedIds.filter((x) => x !== assetId) })
  }

  return (
    <BaseNode id={id} icon={Zap} label="Action Card" selected={selected} status={data.status} nodeType="actionCard">
      <select
        value={data.actionCardId ?? card?.id ?? ""}
        onChange={(event) => updateNode(id, { actionCardId: event.target.value })}
        className="h-9 w-full rounded border border-border bg-background px-2 text-sm text-text-primary"
      >
        {actionCards.map((item) => (
          <option key={item.id} value={item.id}>{item.title}</option>
        ))}
      </select>
      <p className="line-clamp-3 text-xs text-text-muted">{card?.beat ?? "Define the action beat for this shot."}</p>

      {/* Manual image upload — drag-and-drop or click-to-select */}
      <NodeImageUploader
        attachedAssetIds={attachedIds}
        onAttach={attachImage}
        onRemove={removeImage}
        label="Reference images (optional)"
        compact
      />
    </BaseNode>
  )
}

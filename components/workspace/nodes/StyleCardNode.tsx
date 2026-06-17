"use client"

import type { NodeProps } from "@xyflow/react"
import { Palette } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"
import { NodeImageUploader } from "./NodeImageUploader"

export function StyleCardNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const selectedStyle = styleCards.find((card) => card.id === data.styleCardId)

  const attachedIds = data.attachedImageIds ?? []

  function attachImage(assetId: string) {
    const next = attachedIds.includes(assetId) ? attachedIds : [...attachedIds, assetId]
    updateNode(id, { attachedImageIds: next })
  }

  function removeImage(assetId: string) {
    updateNode(id, { attachedImageIds: attachedIds.filter((x) => x !== assetId) })
  }

  return (
    <BaseNode id={id} icon={Palette} label="Style Card" selected={selected} status={data.status} nodeType="styleCard">
      <select
        value={data.styleCardId ?? ""}
        onChange={(event) => updateNode(id, { styleCardId: event.target.value || undefined })}
        className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-background px-2 text-sm text-text-primary outline-none"
      >
        <option value="">Select style card</option>
        {styleCards.map((card) => (
          <option key={card.id} value={card.id}>
            {card.name}
          </option>
        ))}
      </select>
      <p className="line-clamp-3 text-xs">{selectedStyle?.description ?? "Create a style card in Storyboard to drive this node."}</p>

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

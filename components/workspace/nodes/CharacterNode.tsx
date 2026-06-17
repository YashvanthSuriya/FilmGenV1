"use client"

import type { NodeProps } from "@xyflow/react"
import { UserRound } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { BaseNode } from "./BaseNode"
import { NodeImageUploader } from "./NodeImageUploader"

export function CharacterNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const characters = useProjectStore((state) => state.characters)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const character = characters.find((item) => item.id === data.characterId)

  const attachedIds = data.attachedImageIds ?? []

  function attachImage(assetId: string) {
    const next = attachedIds.includes(assetId) ? attachedIds : [...attachedIds, assetId]
    updateNode(id, { attachedImageIds: next })
  }

  function removeImage(assetId: string) {
    updateNode(id, { attachedImageIds: attachedIds.filter((x) => x !== assetId) })
  }

  return (
    <BaseNode id={id} icon={UserRound} label="Character" selected={selected} status={data.status} nodeType="character">
      <select
        value={data.characterId ?? ""}
        onChange={(event) => updateNode(id, { characterId: event.target.value || undefined })}
        className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-background px-2 text-sm text-text-primary outline-none"
      >
        <option value="">Select character</option>
        {characters.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <p className="line-clamp-3 text-xs">{character ? `${character.role}: ${character.description}` : "Create a character in Storyboard to connect cast intent."}</p>

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

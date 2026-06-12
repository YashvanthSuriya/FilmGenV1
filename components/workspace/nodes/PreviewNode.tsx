"use client"

import type { NodeProps } from "@xyflow/react"
import { Image, MonitorPlay, Send, Video } from "lucide-react"
import { useMemo, type MouseEvent } from "react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { getPreviewOutputNodes } from "@/lib/workspace/workflowRun"
import { BaseNode } from "./BaseNode"

export function PreviewNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const assets = useProjectStore((state) => state.assets)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const outputs = useMemo(() => getPreviewOutputNodes(id, nodes, edges), [edges, id, nodes])
  const readyOutputs = outputs.filter((node) => typeof node.data.assetId === "string")
  const assetById = new Map(assets.map((asset) => [asset.id, asset]))

  function sendSequenceToEditing(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    readyOutputs.forEach((node) => {
      if (node.data.assetId) addAssetToTimeline(node.data.assetId)
    })
  }

  return (
    <BaseNode id={id} icon={MonitorPlay} label="Preview" selected={selected} status={data.status} className="w-[340px]" footer={<span>{readyOutputs.length}/{outputs.length} ready</span>}>
      <div className="space-y-3">
        <div className="grid aspect-video grid-cols-2 gap-1 overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background p-1">
          {outputs.length > 0 ? (
            outputs.slice(0, 4).map((node) => {
              const asset = node.data.assetId ? assetById.get(node.data.assetId) : undefined
              const previewUrl = asset?.thumbnailUrl ?? (typeof node.data.previewUrl === "string" ? node.data.previewUrl : "")
              const previewStyle = previewUrl
                ? {
                    backgroundImage: previewUrl.startsWith("linear-gradient") ? previewUrl : `url("${previewUrl}")`
                  }
                : undefined
              const Icon = node.type === "videoOutput" ? Video : Image
              return (
                <div key={node.id} className="relative overflow-hidden rounded bg-elevated bg-cover bg-center" style={previewStyle}>
                  {!previewUrl ? (
                    <div className="grid h-full min-h-16 place-items-center px-2 text-center text-[10px] text-text-muted">
                      Run output
                    </div>
                  ) : null}
                  <div className="absolute left-1 top-1 rounded bg-black/55 p-1 text-white">
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/55 px-1.5 py-0.5 text-[9px] text-white">
                    {asset?.name ?? node.data.label ?? node.type}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="col-span-2 grid place-items-center text-center text-xs text-text-muted">
              Connect image or video outputs to preview the sequence.
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-2 text-xs text-text-secondary">
            {outputs.length > 0 ? `${outputs.length} output node${outputs.length === 1 ? "" : "s"} linked to this preview.` : data.output ?? "No generated outputs connected yet."}
          </p>
          <button
            type="button"
            onClick={sendSequenceToEditing}
            disabled={readyOutputs.length === 0}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-background px-2.5 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Editing
          </button>
        </div>
      </div>
    </BaseNode>
  )
}

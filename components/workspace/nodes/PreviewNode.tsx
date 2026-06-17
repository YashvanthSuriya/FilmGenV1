"use client"

import type { NodeProps } from "@xyflow/react"
import { Image, Loader2, MonitorPlay, Play, Send, Video } from "lucide-react"
import { useMemo, useState, type MouseEvent } from "react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { TimelineTransitionType, WorkspaceNode } from "@/lib/types"
import { analyzeWorkspaceOutput, createWorkspaceMockAsset, getPreviewOutputNodes } from "@/lib/workspace/workflowRun"
import { BaseNode } from "./BaseNode"

const transitionOptions: Array<{ value: TimelineTransitionType; label: string }> = [
  { value: "cut", label: "Cut" },
  { value: "dissolve", label: "Dissolve" },
  { value: "dipToBlack", label: "Dip to Black" },
  { value: "fadeInOut", label: "Fade In/Out" }
]

export function PreviewNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const projectId = useProjectStore((state) => state.projectId)
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const assets = useProjectStore((state) => state.assets)
  const importAsset = useProjectStore((state) => state.importAsset)
  const addAssetSequenceToTimeline = useProjectStore((state) => state.addAssetSequenceToTimeline)
  const clipsCount = useProjectStore((state) => state.editingState.clips.length)
  const outputs = useMemo(() => getPreviewOutputNodes(id, nodes, edges), [edges, id, nodes])
  const readyOutputs = outputs.filter((node) => typeof node.data.assetId === "string")
  const assetById = new Map(assets.map((asset) => [asset.id, asset]))
  const [runningAll, setRunningAll] = useState(false)
  const [runProgress, setRunProgress] = useState<{ current: number; total: number } | null>(null)
  const [transition, setTransition] = useState<TimelineTransitionType>("cut")

  /**
   * Sequence order: by the upstream output node's vertical Y position (top → bottom = shot 1 → shot N).
   * This matches how directors tend to lay out three-shot scenes (top = wide, bottom = close).
   * Falls back to connection order if positions are equal.
   */
  const orderedOutputs = useMemo(
    () => [...outputs].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x),
    [outputs]
  )

  function runSingle(outputNode: WorkspaceNode): Promise<void> {
    return new Promise((resolve) => {
      const nextAnalysis = analyzeWorkspaceOutput(outputNode.id, {
        nodes,
        edges,
        styleCards,
        characters,
        actionCards
      })
      if (!nextAnalysis.ok) {
        updateNode(outputNode.id, {
          status: "error",
          compiledPrompt: nextAnalysis.compiledPrompt,
          errorMessage: nextAnalysis.blockers.join(" ")
        })
        resolve()
        return
      }
      updateNode(outputNode.id, {
        status: "generating",
        compiledPrompt: nextAnalysis.compiledPrompt,
        errorMessage: undefined
      })
      window.setTimeout(() => {
        const asset = createWorkspaceMockAsset({
          node: outputNode,
          projectId,
          compiledPrompt: nextAnalysis.compiledPrompt,
          mediaType: outputNode.type === "videoOutput" ? "videoOutput" : "imageOutput"
        })
        asset.prompt = nextAnalysis.compiledPrompt
        importAsset(asset)
        updateNode(outputNode.id, {
          status: "completed",
          output: `${asset.name} created from ${nextAnalysis.upstreamNodes.length} upstream nodes.`,
          previewUrl: asset.thumbnailUrl,
          assetId: asset.id,
          lastRunAt: asset.createdAt,
          errorMessage: undefined
        })
        resolve()
      }, 420)
    })
  }

  async function runAll(event: MouseEvent<HTMLButtonElement>, force = false) {
    event.stopPropagation()
    if (runningAll || orderedOutputs.length === 0) return
    setRunningAll(true)
    setRunProgress({ current: 0, total: orderedOutputs.length })
    for (let i = 0; i < orderedOutputs.length; i += 1) {
      setRunProgress({ current: i, total: orderedOutputs.length })
      // Skip outputs that are already ready — preserve their existing asset.
      // Unless `force` is true (shift-click), in which case re-run every output.
      if (!force && typeof orderedOutputs[i].data.assetId === "string") continue
      await runSingle(orderedOutputs[i])
    }
    setRunProgress({ current: orderedOutputs.length, total: orderedOutputs.length })
    setRunningAll(false)
    // Clear progress after a brief delay so the user sees "all done"
    window.setTimeout(() => setRunProgress(null), 1500)
  }

  function sendSequenceToEditing(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    const orderedAssetIds = orderedOutputs
      .map((node) => node.data.assetId)
      .filter((assetId): assetId is string => typeof assetId === "string")
    if (orderedAssetIds.length === 0) return
    // Confirm before appending if the timeline already has clips (avoids accidental duplicates).
    if (clipsCount > 0) {
      const ok = window.confirm(`Timeline already has ${clipsCount} clip${clipsCount === 1 ? "" : "s"}. Append this ${orderedAssetIds.length}-clip sequence after the existing clips?`)
      if (!ok) return
    }
    addAssetSequenceToTimeline(orderedAssetIds, transition)
  }

  const readyCount = orderedOutputs.filter((node) => typeof node.data.assetId === "string").length
  const totalCount = orderedOutputs.length
  const progressPct = runProgress ? Math.round((runProgress.current / Math.max(1, runProgress.total)) * 100) : 0

  return (
    <BaseNode id={id} icon={MonitorPlay} label="Preview" selected={selected} status={data.status} className="w-[360px]" footer={<span>{readyCount}/{totalCount} ready</span>} nodeType="preview">
      <div className="space-y-3">
        <div className="grid aspect-video grid-cols-2 gap-1 overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background p-1">
          {orderedOutputs.length > 0 ? (
            orderedOutputs.slice(0, 4).map((node, index) => {
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
                      {node.data.status === "generating" ? "Generating…" : "Run output"}
                    </div>
                  ) : null}
                  <div className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/55 px-1 py-0.5 text-[9px] text-white">
                    <span className="font-bold">{index + 1}</span>
                    <Icon className="h-2.5 w-2.5" />
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

        {/* Sequence controls */}
        <div className="space-y-2 rounded-[var(--radius-sm)] border border-border-subtle bg-background p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Sequence order</span>
            <span className="text-[10px] text-text-secondary">By Y position (top → bottom)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Transition</label>
            <select
              value={transition}
              onChange={(event) => setTransition(event.target.value as TimelineTransitionType)}
              onClick={(event) => event.stopPropagation()}
              className="h-7 flex-1 rounded border border-border-subtle bg-background px-1.5 text-[11px] text-text-secondary outline-none"
            >
              {transitionOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {runProgress ? (
          <div className="rounded-[var(--radius-sm)] border border-accent-cyan/30 bg-accent-cyan-dim p-2 text-[11px] text-accent-cyan">
            <div className="flex items-center justify-between">
              <span>Running all outputs…</span>
              <span>{runProgress.current}/{runProgress.total}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/30">
              <div className="h-full bg-accent-cyan transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-2 text-xs text-text-secondary">
            {orderedOutputs.length > 0 ? `${orderedOutputs.length} output node${orderedOutputs.length === 1 ? "" : "s"} in sequence.` : "No generated outputs connected yet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => runAll(event, event.shiftKey)}
            disabled={runningAll || orderedOutputs.length === 0}
            className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] bg-accent-cyan px-2.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            title="Run all un-run outputs. Shift-click to re-run every output (force)."
          >
            {runningAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run all
          </button>
          <button
            type="button"
            onClick={sendSequenceToEditing}
            disabled={readyCount === 0}
            className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-background px-2.5 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Send sequence
          </button>
        </div>
      </div>
    </BaseNode>
  )
}

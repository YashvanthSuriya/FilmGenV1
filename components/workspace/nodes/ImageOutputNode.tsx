"use client"

import type { NodeProps } from "@xyflow/react"
import { AlertTriangle, Download, Image, Play, Plus, Send, X } from "lucide-react"
import { useMemo, type ChangeEvent, type MouseEvent } from "react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { analyzeWorkspaceOutput, createWorkspaceMockAsset } from "@/lib/workspace/workflowRun"
import { upstreamSignature } from "@/lib/workspace/upstreamSignature"
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1"
import { BaseNode } from "./BaseNode"
import { CompiledPromptPreview } from "./CompiledPromptPreview"
import { ModelSelector } from "./ModelSelector"
import { imageModels } from "@/lib/workspace/modelRegistry"

export function ImageOutputNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const projectId = useProjectStore((state) => state.projectId)
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const assets = useProjectStore((state) => state.assets)
  const importAsset = useProjectStore((state) => state.importAsset)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)

  // Scope the recompute to THIS node's upstream subgraph only.
  // The signature changes only when an upstream node's prompt-relevant data changes
  // or an upstream edge is added/removed — NOT on every global graph edit.
  // This prevents the preview image from visually shifting when you drag unrelated nodes.
  const sig = useMemo(() => upstreamSignature(id, nodes, edges), [id, nodes, edges])
  const analysis = useMemo(
    () => analyzeWorkspaceOutput(id, { nodes, edges, styleCards, characters, actionCards }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig, styleCards, characters, actionCards, id]
  )
  const isGenerating = data.status === "generating"
  const previewUrl = typeof data.previewUrl === "string" ? data.previewUrl : ""
  const canDownloadPreview = previewUrl.startsWith("data:image")
  const previewStyle = previewUrl
    ? {
        backgroundImage: previewUrl.startsWith("linear-gradient") ? previewUrl : `url("${previewUrl}")`
      }
    : undefined

  // Image-to-image references: dropdown of project assets of type image (excluding this node's own asset)
  const imageAssets = useMemo(
    () => assets.filter((asset) => asset.type === "image" && asset.id !== data.assetId),
    [assets, data.assetId]
  )
  const referenceIds = Array.isArray(data.referenceImages) ? data.referenceImages : []
  const referenceAssets = useMemo(
    () => referenceIds.map((rid) => assets.find((asset) => asset.id === rid)).filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)),
    [assets, referenceIds]
  )

  function addReference(event: ChangeEvent<HTMLSelectElement>) {
    event.stopPropagation()
    const value = event.target.value
    if (!value) return
    const next = referenceIds.includes(value) ? referenceIds : [...referenceIds, value]
    updateNode(id, { referenceImages: next })
    // Reset the select so the same option can be picked again if removed
    event.target.value = ""
  }

  function removeReference(event: MouseEvent<HTMLButtonElement>, refId: string) {
    event.stopPropagation()
    updateNode(id, { referenceImages: referenceIds.filter((rid) => rid !== refId) })
  }

  function runImage(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    const node = nodes.find((item) => item.id === id)
    if (!node) return
    const nextAnalysis = analyzeWorkspaceOutput(id, { nodes, edges, styleCards, characters, actionCards })
    if (!nextAnalysis.ok) {
      updateNode(id, {
        status: "error",
        compiledPrompt: nextAnalysis.compiledPrompt,
        errorMessage: nextAnalysis.blockers.join(" ")
      })
      return
    }

    updateNode(id, {
      status: "generating",
      compiledPrompt: nextAnalysis.compiledPrompt,
      errorMessage: undefined
    })

    window.setTimeout(() => {
      const asset = createWorkspaceMockAsset({
        node,
        projectId,
        compiledPrompt: nextAnalysis.compiledPrompt,
        mediaType: "imageOutput"
      })
      // Persist the compiled prompt on the asset for future reference (P2 quality-of-life)
      asset.prompt = nextAnalysis.compiledPrompt
      importAsset(asset)
      updateNode(id, {
        status: "completed",
        output: `${asset.name} created from ${nextAnalysis.upstreamNodes.length} upstream nodes${referenceIds.length > 0 ? ` with ${referenceIds.length} reference image${referenceIds.length === 1 ? "" : "s"}` : ""}.`,
        previewUrl: asset.thumbnailUrl,
        assetId: asset.id,
        lastRunAt: asset.createdAt,
        errorMessage: undefined
      })
    }, 8500)
  }

  function sendToEditing(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (data.assetId) addAssetToTimeline(data.assetId)
  }

  return (
    <BaseNode id={id} icon={Image} label="Image Output" selected={selected} status={data.status} className="w-[320px]" footer={<span>{data.assetId ? "Asset ready" : "Local mock"}</span>} nodeType="imageOutput">
      <ImageGeneration isGenerating={isGenerating} label={data.label}>
        <div className="relative grid aspect-video place-items-center bg-elevated bg-cover bg-center text-xs text-text-muted" style={previewStyle}>
          {!previewUrl ? <span>{isGenerating ? "" : "Run image to create a workspace asset"}</span> : null}
          {referenceAssets.length > 0 ? (
            <div className="absolute right-1 top-1 flex gap-1">
              {referenceAssets.slice(0, 3).map((asset) => (
                <div
                  key={asset.id}
                  className="h-6 w-9 rounded-sm border border-white/30 bg-cover bg-center"
                  style={{ backgroundImage: asset.thumbnailUrl?.startsWith("linear-gradient") ? asset.thumbnailUrl : `url("${asset.thumbnailUrl}")` }}
                  title={`Reference: ${asset.name}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </ImageGeneration>
      <div className="space-y-2 p-2">
          <CompiledPromptPreview prompt={analysis.compiledPrompt} />

          {/* Model selector + model-specific features */}
          <ModelSelector
            nodeId={id}
            modelId={data.modelId}
            modelParams={data.modelParams}
            models={imageModels}
            onChangeModel={(modelId) => updateNode(id, { modelId })}
            onChangeParam={(key, value) => updateNode(id, { modelParams: { ...(data.modelParams ?? {}), [key]: value } })}
          />

          {/* Image-to-image references */}
          <div className="rounded-[var(--radius-sm)] border border-border-subtle bg-background p-2">
            <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">References (image-to-image)</p>
            {referenceAssets.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1">
                {referenceAssets.map((asset) => (
                  <span key={asset.id} className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-elevated px-1.5 py-0.5 text-[10px] text-text-secondary">
                    <span className="max-w-[80px] truncate">{asset.name}</span>
                    <button
                      type="button"
                      onClick={(event) => removeReference(event, asset.id)}
                      className="text-text-muted hover:text-accent-red"
                      aria-label={`Remove reference ${asset.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-text-muted" />
              <select
                value=""
                onChange={addReference}
                onClick={(event) => event.stopPropagation()}
                className="h-7 min-w-0 flex-1 rounded border border-border-subtle bg-background px-1.5 text-[11px] text-text-secondary outline-none"
                aria-label="Add reference image"
              >
                <option value="">Add a reference…</option>
                {imageAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="line-clamp-2 text-xs text-text-secondary">{data.output ?? "Connect prompts, cards, and camera nodes to build this image."}</p>
          {data.errorMessage ? (
            <p className="flex gap-1.5 rounded border border-accent-red/40 bg-accent-red-dim p-2 text-[11px] leading-4 text-accent-red">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {data.errorMessage}
            </p>
          ) : analysis.blockers.length > 0 ? (
            <p className="flex gap-1.5 rounded border border-accent-amber/40 bg-accent-amber/10 p-2 text-[11px] leading-4 text-accent-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {analysis.blockers[0]}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runImage}
              disabled={isGenerating}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] bg-accent-cyan px-2.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-3.5 w-3.5" />
              {isGenerating ? "Generating..." : "Run Image"}
            </button>
            <button
              type="button"
              onClick={sendToEditing}
              disabled={!data.assetId}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-background px-2.5 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              Editing
            </button>
            {canDownloadPreview ? (
              <a
                href={previewUrl}
                download={`${String(data.label ?? "workspace-image").replace(/\s+/g, "-").toLowerCase()}.svg`}
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-border bg-background text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
                onClick={(event) => event.stopPropagation()}
                aria-label="Download image preview"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
    </BaseNode>
  )
}

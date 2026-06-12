"use client"

import type { NodeProps } from "@xyflow/react"
import { AlertTriangle, Download, Loader2, Play, Send, Video } from "lucide-react"
import { useMemo, type MouseEvent } from "react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceNode } from "@/lib/types"
import { analyzeWorkspaceOutput, createWorkspaceMockAsset } from "@/lib/workspace/workflowRun"
import { BaseNode } from "./BaseNode"

export function VideoOutputNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const projectId = useProjectStore((state) => state.projectId)
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const importAsset = useProjectStore((state) => state.importAsset)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const analysis = useMemo(
    () => analyzeWorkspaceOutput(id, { nodes, edges, styleCards, characters, actionCards }),
    [actionCards, characters, edges, id, nodes, styleCards]
  )
  const isGenerating = data.status === "generating"
  const previewUrl = typeof data.previewUrl === "string" ? data.previewUrl : ""
  const canDownloadPreview = previewUrl.startsWith("data:image")
  const previewStyle = previewUrl
    ? {
        backgroundImage: previewUrl.startsWith("linear-gradient") ? previewUrl : `url("${previewUrl}")`
      }
    : undefined

  function runVideo(event: MouseEvent<HTMLButtonElement>) {
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
        mediaType: "videoOutput"
      })
      importAsset(asset)
      updateNode(id, {
        status: "completed",
        output: `${asset.name} mocked as an 8s video from ${nextAnalysis.upstreamNodes.length} upstream nodes.`,
        previewUrl: asset.thumbnailUrl,
        assetId: asset.id,
        lastRunAt: asset.createdAt,
        errorMessage: undefined
      })
    }, 520)
  }

  function sendToEditing(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (data.assetId) addAssetToTimeline(data.assetId)
  }

  return (
    <BaseNode id={id} icon={Video} label="Video Output" selected={selected} status={data.status} className="w-[300px]" footer={<span>{data.assetId ? "Clip ready" : "Local mock"}</span>}>
      <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background">
        <div className="relative grid aspect-video place-items-center bg-elevated bg-cover bg-center text-xs text-text-muted" style={previewStyle}>
          {!previewUrl ? <span>{isGenerating ? "Creating motion mock..." : "Run video to create a timeline asset"}</span> : null}
          {isGenerating ? (
            <div className="absolute inset-0 grid place-items-center bg-black/42">
              <Loader2 className="h-7 w-7 animate-spin text-accent-cyan" />
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-2">
          <p className="line-clamp-2 text-xs text-text-secondary">{(data.output ?? analysis.compiledPrompt) || "Connect a generated frame, prompt, script, or camera node to build this clip."}</p>
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
              onClick={runVideo}
              disabled={isGenerating}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] bg-accent-cyan px-2.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Run Video
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
                download={`${String(data.label ?? "workspace-video").replace(/\s+/g, "-").toLowerCase()}-poster.svg`}
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-border bg-background text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
                onClick={(event) => event.stopPropagation()}
                aria-label="Download video poster"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </BaseNode>
  )
}

"use client"

import { Copy, GripVertical, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { StoryboardFrame } from "@/lib/types"

const shotTypes = ["Wide", "Medium", "Close-up", "Extreme Close-up", "POV"]
const movements = ["Static", "Pan", "Tilt", "Zoom", "Dolly", "Handheld"]

export function StoryboardFrameCard({ frame, index }: { frame: StoryboardFrame; index: number }) {
  const router = useRouter()
  const updateStoryboardFrame = useProjectStore((state) => state.updateStoryboardFrame)
  const duplicateStoryboardFrame = useProjectStore((state) => state.duplicateStoryboardFrame)
  const deleteStoryboardFrame = useProjectStore((state) => state.deleteStoryboardFrame)
  const addStoryboardAsset = useProjectStore((state) => state.addStoryboardAsset)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const sendStoryboardFrameToWorkspace = useProjectStore((state) => state.sendStoryboardFrameToWorkspace)
  const workspaceNodes = useWorkspaceStore((state) => state.nodes)
  const workspaceEdges = useWorkspaceStore((state) => state.edges)
  const setWorkspaceNodes = useWorkspaceStore((state) => state.setNodes)
  const setWorkspaceEdges = useWorkspaceStore((state) => state.setEdges)
  const selectWorkspaceNode = useWorkspaceStore((state) => state.selectNode)

  function sendToWorkspace() {
    const result = sendStoryboardFrameToWorkspace(frame.id)
    if (!result) return
    setWorkspaceNodes([...workspaceNodes, ...result.nodes])
    setWorkspaceEdges([...workspaceEdges, ...result.edges])
    selectWorkspaceNode(result.selectedNodeId)
    router.push("/studio?tab=workspace")
  }

  function addToEditing() {
    const asset = addStoryboardAsset(frame.id)
    if (!asset) return
    addAssetToTimeline(asset.id)
    router.push("/studio?tab=editing")
  }

  return (
    <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-sm transition hover:border-border-strong hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border-subtle bg-elevated px-3 py-2">
        <div className="min-w-0">
          <p className="font-heading text-[10px] uppercase tracking-[0.08em] text-accent-cyan">SH-{String(index + 1).padStart(2, "0")}</p>
          <input
            value={frame.title}
            onChange={(event) => updateStoryboardFrame(frame.id, { title: event.target.value })}
            className="mt-1 w-full bg-transparent font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary outline-none focus:text-accent-cyan"
            aria-label={`Shot ${index + 1} title`}
          />
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-text-muted" />
      </div>
      <div className={`group relative ${frame.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"}`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            background:
              frame.imageUrl ??
              "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(255,184,0,0.08), rgba(155,89,255,0.18))"
          }}
        />
        <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/55 group-hover:flex">
          <Button size="icon" variant="secondary" aria-label="Regenerate frame">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" aria-label="Edit prompt">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-elevated p-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={frame.shotType}
            onChange={(event) => updateStoryboardFrame(frame.id, { shotType: event.target.value })}
            className="h-7 rounded border border-border bg-surface px-2 text-xs text-text-primary outline-none focus:border-accent-cyan"
          >
            {shotTypes.map((shotType) => (
              <option key={shotType}>{shotType}</option>
            ))}
          </select>
          <select
            value={frame.cameraMovement}
            onChange={(event) => updateStoryboardFrame(frame.id, { cameraMovement: event.target.value })}
            className="h-7 rounded border border-border bg-surface px-2 text-xs text-text-primary outline-none focus:border-accent-cyan"
          >
            {movements.map((movement) => (
              <option key={movement}>{movement}</option>
            ))}
          </select>
          <select
            value={frame.aspectRatio}
            onChange={(event) => updateStoryboardFrame(frame.id, { aspectRatio: event.target.value as StoryboardFrame["aspectRatio"] })}
            className="h-7 rounded border border-border bg-surface px-2 text-xs text-text-primary outline-none focus:border-accent-cyan"
          >
            <option>16:9</option>
            <option>9:16</option>
          </select>
          <span className="grid h-7 place-items-center rounded border border-border bg-background px-2 font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Frame ready</span>
        </div>
      </div>

      <div className="p-3">
        <textarea
          value={frame.prompt}
          onChange={(event) => updateStoryboardFrame(frame.id, { prompt: event.target.value })}
          className="min-h-20 w-full resize-none rounded-[var(--radius-md)] border border-transparent bg-transparent text-sm text-text-secondary outline-none focus:border-border focus:bg-elevated"
        />
        {frame.referenceImages.length > 0 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {frame.referenceImages.map((reference, referenceIndex) => (
              <div
                key={`${frame.id}-${referenceIndex}`}
                className="h-10 w-10 shrink-0 rounded-[var(--radius-sm)] border border-border-subtle"
                style={{ background: reference }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle px-3 py-2">
        <div className="flex items-center gap-1 text-text-muted">
          <button type="button" aria-label="Duplicate frame" onClick={() => duplicateStoryboardFrame(frame.id)} className="rounded p-1 hover:bg-elevated hover:text-text-primary">
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Delete frame" onClick={() => deleteStoryboardFrame(frame.id)} className="rounded p-1 hover:bg-accent-red-dim hover:text-accent-red">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="text-accent-cyan hover:text-accent-cyan" onClick={addToEditing}>
            <Plus className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-accent-amber hover:text-accent-amber" onClick={sendToWorkspace}>
            <Send className="mr-2 h-4 w-4" />
            Workspace
          </Button>
        </div>
      </div>
    </article>
  )
}

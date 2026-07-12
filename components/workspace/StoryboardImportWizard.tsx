"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Layers, X } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useStoryboardStore } from "@/lib/stores/storyboard"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { buildWorkspaceFromStoryboard } from "@/lib/workspace/storyboardImport"
import type { GenerationResult, ProjectAsset } from "@/lib/types"

export function StoryboardImportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const projectId = useProjectStore((state) => state.activeProjectId)
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const assets = useProjectStore((state) => state.assets)
  const importAsset = useProjectStore((state) => state.importAsset)
  const projectState = useStoryboardStore((state) => state.projects[projectId])
  const setNodes = useWorkspaceStore((state) => state.setNodes)
  const setEdges = useWorkspaceStore((state) => state.setEdges)
  const setViewport = useWorkspaceStore((state) => state.setViewport)
  const selectNode = useWorkspaceStore((state) => state.selectNode)
  const nodes = useWorkspaceStore((state) => state.nodes)

  const generations: GenerationResult[] = projectState?.generations ?? []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [styleCardId, setStyleCardId] = useState<string>("")
  const [characterId, setCharacterId] = useState<string>("")
  const [includeAction, setIncludeAction] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedIds(new Set(generations.map((g) => g.id)))
    const applied = projectState?.composer.appliedCardIds ?? []
    const appliedStyle = applied.find((id) => styleCards.some((s) => s.id === id))
    const appliedCharacter = applied.find((id) => characters.some((c) => c.id === id))
    setStyleCardId(appliedStyle ?? "")
    setCharacterId(appliedCharacter ?? "")
    setIncludeAction(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(generations.map((g) => g.id)))
  }

  function clearAll() {
    setSelectedIds(new Set())
  }

  function apply() {
    const selectedGenerations = generations.filter((g) => selectedIds.has(g.id))
    if (selectedGenerations.length === 0) return

    if (nodes.length > 0 && !window.confirm("Replace the current workspace with this storyboard import?")) return

    // Import each storyboard generation as a real project asset so the workspace
    // Image Output nodes are immediately usable in Editing.
    const assetIdByGenId = new Map<string, string>()
    const existingAssetByUrl = new Map(assets.map((a) => [a.url ?? "", a]))
    for (const gen of selectedGenerations) {
      const existing = existingAssetByUrl.get(gen.imageUrl)
      if (existing) {
        assetIdByGenId.set(gen.id, existing.id)
        continue
      }
      const asset: ProjectAsset = {
        id: `asset-sb-${gen.id}-${Date.now()}`,
        source: "storyboard",
        type: gen.mediaType === "video" ? "video" : "image",
        name: gen.templateName ?? gen.prompt.slice(0, 40) ?? "Storyboard frame",
        prompt: gen.prompt,
        url: gen.imageUrl,
        thumbnailUrl: gen.imageUrl,
        mimeType: gen.mediaType === "video" ? "video/mp4" : "image/svg+xml",
        duration: gen.mediaType === "video" ? (gen.durationSeconds ?? 5) : 5,
        createdAt: new Date().toISOString(),
        storyboardFrameId: gen.id
      }
      importAsset(asset)
      assetIdByGenId.set(gen.id, asset.id)
    }

    const built = buildWorkspaceFromStoryboard({
      generations: selectedGenerations,
      styleCards,
      characters,
      actionCards,
      styleCardId: styleCardId || undefined,
      characterId: characterId || undefined,
      includeActionCard: includeAction,
      camera: projectState?.composer.camera,
      assetIdByGenId
    })
    setNodes(built.nodes)
    setEdges(built.edges)
    setViewport(built.viewport)
    selectNode(built.nodes[built.nodes.length - 1]?.id ?? null)
    onClose()
    router.push("/studio?tab=workspace")
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.2rem] border border-border-subtle bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-(--radius-md) bg-accent-cyan-dim text-accent-cyan">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Send to Workspace</p>
              <h2 className="font-heading text-lg font-bold text-text-primary">Pick frames + creative inputs</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-text-muted hover:border-accent-red hover:text-accent-red"
            aria-label="Close wizard"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {generations.length === 0 ? (
            <div className="grid min-h-[200px] place-items-center rounded-(--radius-md) border border-dashed border-border-subtle p-6 text-center">
              <div>
                <p className="font-heading text-base font-semibold text-text-primary">No Storyboard generations yet</p>
                <p className="mt-1 text-xs text-text-secondary">Generate at least one image in the Storyboard tab to import it here.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted">
                  Select frames ({selectedIds.size}/{generations.length})
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-[11px] text-accent-cyan hover:underline">Select all</button>
                  <button type="button" onClick={clearAll} className="text-[11px] text-text-muted hover:underline">Clear</button>
                </div>
              </div>

              <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
                {generations.map((gen) => {
                  const selected = selectedIds.has(gen.id)
                  return (
                    <button
                      key={gen.id}
                      type="button"
                      onClick={() => toggle(gen.id)}
                      className={`flex items-center gap-3 rounded-(--radius-md) border p-2 text-left transition ${
                        selected
                          ? "border-accent-cyan bg-accent-cyan-dim"
                          : "border-border-subtle bg-background hover:border-border-strong"
                      }`}
                    >
                      <div
                        className="h-12 w-20 shrink-0 rounded-sm border border-border-subtle bg-cover bg-center"
                        style={{
                          backgroundImage: gen.imageUrl?.startsWith("linear-gradient")
                            ? gen.imageUrl
                            : gen.imageUrl?.startsWith("data:")
                              ? `url("${gen.imageUrl}")`
                              : undefined
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {gen.templateName ?? gen.prompt.slice(0, 40) ?? "Untitled"}
                        </p>
                        <p className="truncate text-[10px] text-text-muted">
                          {gen.cardType} · {gen.mediaType ?? "image"} · {gen.aspectRatio}
                        </p>
                      </div>
                      <div className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-accent-cyan bg-accent-cyan text-black" : "border-border-subtle"}`}>
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Style + Character selectors — "None" is a valid first option */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Style card (optional)</label>
                  <select
                    value={styleCardId}
                    onChange={(event) => setStyleCardId(event.target.value)}
                    className="mt-1 h-9 w-full rounded border border-border-subtle bg-background px-2 text-sm text-text-primary outline-none"
                  >
                    <option value="">— None —</option>
                    {styleCards.map((card) => (
                      <option key={card.id} value={card.id}>{card.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Character (optional)</label>
                  <select
                    value={characterId}
                    onChange={(event) => setCharacterId(event.target.value)}
                    className="mt-1 h-9 w-full rounded border border-border-subtle bg-background px-2 text-sm text-text-primary outline-none"
                  >
                    <option value="">— None —</option>
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={includeAction}
                  onChange={(event) => setIncludeAction(event.target.checked)}
                  className="h-3.5 w-3.5 accent-(--accent-cyan)"
                />
                Also attach the first action card ({actionCards[0]?.title ?? "none"}) to every shot
              </label>

              <div className="mt-5 rounded-(--radius-md) border border-border-subtle bg-background p-3 text-[11px] text-text-muted">
                <p className="font-semibold text-text-secondary">Preview of the graph that will be built:</p>
                <ul className="mt-1.5 list-disc pl-4">
                  <li>{selectedIds.size} Prompt + Camera + Image Output cluster{selectedIds.size === 1 ? "" : "s"}, stacked vertically</li>
                  <li>Each Image Output node is pre-loaded with its storyboard image as a real project asset — <span className="text-accent-cyan">Send to Editing works immediately</span></li>
                  {styleCardId ? <li>1 shared Style Card node</li> : <li>No style card attached — add one manually in the workspace if needed</li>}
                  {characterId ? <li>1 shared Character node</li> : <li>No character attached — add one manually in the workspace if needed</li>}
                  {includeAction ? <li>1 shared Action Card</li> : null}
                  <li>1 Preview node at the right, collecting all Image Outputs in Y-axis order (top → bottom = shot 1 → shot N)</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border-subtle px-5 py-3">
          <p className="text-[11px] text-text-muted">
            {selectedIds.size} of {generations.length} selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-(--radius-md) border border-border-subtle px-3 py-2 text-xs text-text-secondary hover:bg-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-1.5 rounded-(--radius-md) bg-accent-cyan px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Build workspace
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

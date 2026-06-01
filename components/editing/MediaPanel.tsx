"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, ImageIcon, Music, Plus, Upload, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import { createObjectUrlForBlobKey, saveBlobForAsset } from "@/lib/media/indexedDb"
import type { ProjectAsset } from "@/lib/types"

type MediaFilter = "all" | ProjectAsset["type"]

function MediaIcon({ type }: { type: ProjectAsset["type"] }) {
  if (type === "audio") return <Music className="h-4 w-4 text-accent-amber" />
  if (type === "video") return <Video className="h-4 w-4 text-accent-cyan" />
  return <ImageIcon className="h-4 w-4 text-accent-purple" />
}

function readMediaDuration(url: string, type: ProjectAsset["type"]) {
  if (type === "image") return Promise.resolve(5)
  return new Promise<number | undefined>((resolve) => {
    const element = document.createElement(type === "video" ? "video" : "audio")
    element.preload = "metadata"
    element.onloadedmetadata = () => resolve(Number.isFinite(element.duration) ? element.duration : undefined)
    element.onerror = () => resolve(undefined)
    element.src = url
  })
}

export function MediaPanel() {
  const [open, setOpen] = useState(true)
  const [filter, setFilter] = useState<MediaFilter>("all")
  const assets = useProjectStore((state) => state.assets)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const importAsset = useProjectStore((state) => state.importAsset)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const restoredBlobKeysRef = useRef(new Set<string>())
  const [importError, setImportError] = useState<string | null>(null)
  const filteredAssets = assets.filter((asset) => filter === "all" || asset.type === filter)
  const counts = {
    all: assets.length,
    image: assets.filter((asset) => asset.type === "image").length,
    video: assets.filter((asset) => asset.type === "video").length,
    audio: assets.filter((asset) => asset.type === "audio").length
  }

  useEffect(() => {
    let cancelled = false
    assets
      .filter((asset) => asset.blobKey)
      .forEach((asset) => {
        if (!asset.blobKey || restoredBlobKeysRef.current.has(asset.blobKey)) return
        restoredBlobKeysRef.current.add(asset.blobKey)
        void createObjectUrlForBlobKey(asset.blobKey).then((url) => {
          if (!cancelled && url && asset.url !== url) importAsset({ ...asset, url, thumbnailUrl: asset.type === "image" ? url : asset.thumbnailUrl })
        }).catch(() => undefined)
      })
    return () => {
      cancelled = true
    }
  }, [assets, importAsset])

  async function importFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setImportError(null)
    for (const file of Array.from(files)) {
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : null
      if (!type) {
        setImportError(`${file.name} is not a supported image, video, or audio file.`)
        continue
      }
      const id = `asset-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const blobKey = `media-${id}`
      await saveBlobForAsset(blobKey, file)
      const url = URL.createObjectURL(file)
      const duration = await readMediaDuration(url, type)
      importAsset({
        id,
        source: "workspace",
        type,
        name: file.name.replace(/\.[^.]+$/, ""),
        url,
        thumbnailUrl: type === "image" || type === "video" ? url : undefined,
        blobKey,
        mimeType: file.type,
        fileSize: file.size,
        duration,
        createdAt: new Date().toISOString()
      })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <aside className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-b border-border-subtle bg-surface/95 lg:border-b-0 lg:border-r">
      <div className="flex min-h-11 items-center justify-between gap-2 border-b border-border-subtle px-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Media</h2>
          <Badge>{counts.all}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={(event) => void importFiles(event.target.files)} />
          <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} aria-label="Import media">
            <Upload className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setOpen((value) => !value)} aria-label={open ? "Collapse media" : "Expand media"}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 p-3">
          {importError ? <div className="rounded border border-accent-red bg-accent-red/10 p-2 text-xs text-accent-red">{importError}</div> : null}
          <div className="grid grid-cols-4 gap-1 rounded-[var(--radius-md)] border border-border-subtle bg-background p-1">
            <FilterButton label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
            <FilterButton label="Images" count={counts.image} active={filter === "image"} onClick={() => setFilter("image")} />
            <FilterButton label="Videos" count={counts.video} active={filter === "video"} onClick={() => setFilter("video")} />
            <FilterButton label="Audio" count={counts.audio} active={filter === "audio"} onClick={() => setFilter("audio")} />
          </div>
          <div data-testid="media-asset-scroll" className="flex min-h-0 max-h-44 max-w-full gap-3 overflow-x-auto overflow-y-hidden lg:max-h-none lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
            {filteredAssets.map((item) => (
              <div
                key={item.id}
                draggable
                data-asset-type={item.type}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "copy"
                  event.dataTransfer.setData("application/x-cine-asset", item.id)
                  event.dataTransfer.setData("text/plain", item.id)
                }}
                className="flex min-h-28 min-w-72 items-start gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-2 text-left transition hover:border-accent-cyan hover:bg-overlay lg:min-w-0"
              >
                <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded border border-border-subtle bg-background">
                  {item.type === "image" && item.url ? (
                    item.url.startsWith("linear-gradient") ? <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: item.url }} /> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    )
                  ) : item.type === "video" && item.url ? (
                    <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : item.type === "audio" ? (
                    <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(90deg,rgba(255,184,0,0.28)_0_3px,transparent_3px_9px)]">
                      <MediaIcon type={item.type} />
                    </div>
                  ) : <MediaIcon type={item.type} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">{item.name}</p>
                    <Badge className="shrink-0">{item.source}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{item.prompt ?? "Static demo asset"}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">{item.duration ? `${item.duration.toFixed(1)}s` : "Still"} / {item.type}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 h-7 px-2 text-accent-cyan"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    onClick={() => addAssetToTimeline(item.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function FilterButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`h-8 rounded px-2 font-heading text-[10px] uppercase tracking-[0.08em] transition ${active ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:bg-elevated hover:text-text-primary"}`}
      onClick={onClick}
    >
      {label} <span className="text-text-muted">{count}</span>
    </button>
  )
}

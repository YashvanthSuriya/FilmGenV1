"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, ImageIcon, Music, Plus, Upload, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import { createObjectUrlForBlobKey, saveMediaBlob } from "@/lib/media/indexedDb"
import type { ProjectAsset } from "@/lib/types"

function MediaIcon({ type }: { type: ProjectAsset["type"] }) {
  if (type === "audio") return <Music className="h-4 w-4 text-accent-amber" />
  if (type === "video") return <Video className="h-4 w-4 text-accent-cyan" />
  return <ImageIcon className="h-4 w-4 text-accent-purple" />
}

export function MediaPanel() {
  const [open, setOpen] = useState(true)
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({})
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const assets = useProjectStore((state) => state.assets)
  const addImportedAsset = useProjectStore((state) => state.addImportedAsset)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)

  useEffect(() => {
    let cancelled = false
    const createdUrls: string[] = []
    async function loadUrls() {
      const pairs = await Promise.all(
        assets.map(async (asset) => {
          if (asset.url) return [asset.id, asset.url] as const
          const objectUrl = await createObjectUrlForBlobKey(asset.blobKey)
          if (objectUrl) createdUrls.push(objectUrl)
          return [asset.id, objectUrl] as const
        })
      )
      if (!cancelled) {
        const nextUrls: Record<string, string> = {}
        pairs.forEach(([id, url]) => {
          if (url) nextUrls[id] = url
        })
        setAssetUrls(nextUrls)
      }
    }
    void loadUrls()
    return () => {
      cancelled = true
      createdUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [assets])

  async function importFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      const asset = addImportedAsset(file)
      await saveMediaBlob(asset.id, file)
    }
  }

  return (
    <aside className="min-w-0 border-t border-border-subtle bg-surface/95">
      <div className="flex h-9 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Media</h2>
          <Badge>{assets.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <input ref={videoInputRef} hidden type="file" accept="video/*" multiple onChange={(event) => void importFiles(event.target.files)} />
          <input ref={imageInputRef} hidden type="file" accept="image/*" multiple onChange={(event) => void importFiles(event.target.files)} />
          <input ref={audioInputRef} hidden type="file" accept="audio/*" multiple onChange={(event) => void importFiles(event.target.files)} />
          <Button size="sm" variant="ghost" onClick={() => videoInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Video
          </Button>
          <Button size="sm" variant="ghost" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button size="sm" variant="ghost" onClick={() => audioInputRef.current?.click()}>
            <Music className="h-4 w-4" />
            Audio
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setOpen((value) => !value)} aria-label={open ? "Collapse media" : "Expand media"}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="flex max-h-32 max-w-full gap-3 overflow-x-auto px-4 pb-3">
          {assets.length === 0 ? (
            <div className="w-full rounded-[var(--radius-md)] border border-dashed border-border-subtle bg-background px-4 py-5 text-center text-sm text-text-muted">
              Import media or publish outputs from Workspace. Everything you add here can go straight to the timeline.
            </div>
          ) : (
            assets.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("application/x-cine-asset", item.id)}
                className="flex h-28 min-w-72 items-start gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-2 text-left transition hover:border-accent-cyan hover:bg-overlay"
              >
                <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded border border-border-subtle bg-background">
                  {item.type !== "audio" && assetUrls[item.id] ? (
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${assetUrls[item.id]})` }} />
                  ) : (
                    <MediaIcon type={item.type} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">{item.name}</p>
                    <Badge className="shrink-0">{item.source}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{item.prompt || item.url || item.id}</p>
                  <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-accent-cyan" onClick={() => addAssetToTimeline(item.id, undefined, undefined, assetUrls[item.id])}>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </aside>
  )
}

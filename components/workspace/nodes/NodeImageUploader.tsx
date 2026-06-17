"use client"

import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import type { ProjectAsset } from "@/lib/types"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Shared image uploader for the Style / Character / Action workspace nodes.
 *
 * Supports two input modes:
 *   1. Drag-and-drop an image file onto the drop zone.
 *   2. Click the drop zone to open the file picker.
 *
 * On file selection: reads the file as a data URL, creates a `ProjectAsset` of type "image"
 * in the project store, and calls `onAttach(assetId)` so the parent node can store the ID
 * in its `attachedImageIds` array. Already-attached images render as thumbnails with a
 * remove button.
 */
export function NodeImageUploader({
  attachedAssetIds,
  onAttach,
  onRemove,
  label = "Reference images",
  compact = false
}: {
  attachedAssetIds: string[]
  onAttach: (assetId: string) => void
  onRemove: (assetId: string) => void
  label?: string
  compact?: boolean
}) {
  const assets = useProjectStore((state) => state.assets)
  const importAsset = useProjectStore((state) => state.importAsset)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)

  const attachedAssets = attachedAssetIds
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is ProjectAsset => Boolean(a))

  function handleFiles(files: FileList | File[]) {
    const file = files[0]
    if (!file) return
    setError(null)

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Use PNG, JPEG, WebP, or GIF.")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("File is over 10 MB.")
      return
    }

    setReading(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const asset: ProjectAsset = {
        id: `asset-upload-${Date.now()}`,
        source: "storyboard", // reuse the storyboard source bucket — it's a local upload either way
        type: "image",
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Uploaded image",
        prompt: "",
        url: dataUrl,
        thumbnailUrl: dataUrl,
        mimeType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString()
      }
      importAsset(asset)
      onAttach(asset.id)
      setReading(false)
    }
    reader.onerror = () => {
      setError("Could not read the file.")
      setReading(false)
    }
    reader.readAsDataURL(file)
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(false)
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files)
    }
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(true)
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(false)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      handleFiles(event.target.files)
    }
    // Reset so the same file can be picked again after removal
    event.target.value = ""
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted">{label}</p>

      {/* Drop zone / click-to-select */}
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-1.5 border border-dashed text-center transition",
          compact ? "min-h-9 px-2 py-1.5" : "min-h-12 px-3 py-2",
          dragOver
            ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
            : "border-border-subtle bg-background text-text-muted hover:border-accent-cyan/50 hover:text-text-secondary"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={onInputChange}
        />
        {reading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5" />
        )}
        <span className="text-[10px]">
          {reading ? "Reading..." : dragOver ? "Drop to attach" : "Drag image or click to upload"}
        </span>
      </label>

      {error ? (
        <p className="text-[10px] text-accent-red">{error}</p>
      ) : null}

      {/* Attached thumbnails */}
      {attachedAssets.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {attachedAssets.map((asset) => (
            <div
              key={asset.id}
              className="relative h-12 w-16 overflow-hidden rounded-sm border border-border-subtle"
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: asset.thumbnailUrl?.startsWith("linear-gradient")
                    ? asset.thumbnailUrl
                    : asset.thumbnailUrl
                      ? `url("${asset.thumbnailUrl}")`
                      : undefined
                }}
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove(asset.id)
                }}
                className="absolute right-0.5 top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-black/70 text-white hover:bg-accent-red"
                aria-label={`Remove ${asset.name}`}
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

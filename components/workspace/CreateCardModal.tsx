"use client"

import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { Loader2, Plus, X, Zap, Palette, UserRound, ImagePlus } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import type { ActionCard, Character, StyleCard, ProjectAsset } from "@/lib/types"
import { cn } from "@/lib/utils"

type CardType = "style" | "character" | "action"

const cardTypeOptions: Array<{ value: CardType; label: string; icon: typeof Palette }> = [
  { value: "style", label: "Style Card", icon: Palette },
  { value: "character", label: "Character", icon: UserRound },
  { value: "action", label: "Action Card", icon: Zap }
]

export function CreateCardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addStyleCard = useProjectStore((state) => state.addStyleCard)
  const addCharacter = useProjectStore((state) => state.addCharacter)
  const addActionCard = useProjectStore((state) => state.addActionCard)
  const importAsset = useProjectStore((state) => state.importAsset)

  const [cardType, setCardType] = useState<CardType>("style")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  // Action-specific fields
  const [beat, setBeat] = useState("")
  const [subject, setSubject] = useState("")
  const [action, setAction] = useState("")
  const [emotion, setEmotion] = useState("")
  // Character-specific fields
  const [role, setRole] = useState("")
  // Uploaded images
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!open) return null

  function reset() {
    setCardType("style")
    setName("")
    setDescription("")
    setBeat("")
    setSubject("")
    setAction("")
    setEmotion("")
    setRole("")
    setUploadedImageUrls([])
    setUploadError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleFiles(files: FileList | File[]) {
    const file = files[0]
    if (!file) return
    setUploadError(null)

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPEG, WebP).")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is over 10 MB.")
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Also import as a project asset so it appears in Editing
      const asset: ProjectAsset = {
        id: `asset-card-${Date.now()}`,
        source: "storyboard",
        type: "image",
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Card image",
        prompt: "",
        url: dataUrl,
        thumbnailUrl: dataUrl,
        mimeType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString()
      }
      importAsset(asset)
      setUploadedImageUrls((prev) => [...prev, dataUrl])
      setUploading(false)
    }
    reader.onerror = () => {
      setUploadError("Could not read the file.")
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files)
    }
  }

  function removeImage(index: number) {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const trimmedName = name.trim() || "Untitled"
    const id = `card-${Date.now()}`

    if (cardType === "style") {
      const styleCard: StyleCard = {
        id,
        name: trimmedName,
        description: description.trim(),
        referenceImages: uploadedImageUrls,
        generatedImages: uploadedImageUrls,
        keywords: [],
        mood: "User-defined",
        palette: [],
        primaryReference: uploadedImageUrls[0]
      }
      addStyleCard(styleCard)
    } else if (cardType === "character") {
      const character: Character = {
        id,
        name: trimmedName,
        role: role.trim() || "User-defined",
        description: description.trim(),
        emotions: ["Neutral"],
        portraitUrls: uploadedImageUrls,
        styleCardIds: []
      }
      addCharacter(character)
    } else {
      const actionCard: ActionCard = {
        id,
        title: trimmedName,
        beat: beat.trim() || description.trim(),
        subject: subject.trim() || "User-defined",
        action: action.trim() || "See description",
        emotion: emotion.trim() || "User-defined"
      }
      addActionCard(actionCard)
    }

    handleClose()
  }

  const canSave = name.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.2rem] border border-border-subtle bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Create card</p>
            <h2 className="font-heading text-lg font-bold text-text-primary">New creative card</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-text-muted hover:border-accent-red hover:text-accent-red"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Card type selector */}
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Card type</label>
            <div className="inline-flex w-full overflow-hidden rounded-[var(--radius-md)] border border-border-subtle">
              {cardTypeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCardType(value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition",
                    cardType === value ? "bg-accent-cyan text-black" : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">
              {cardType === "action" ? "Title" : cardType === "character" ? "Character name" : "Style name"}
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={cardType === "action" ? "e.g. Market Crossing" : cardType === "character" ? "e.g. Mira Vale" : "e.g. Neon Rain Noir"}
              className="h-9 w-full rounded border border-border-subtle bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan"
            />
          </div>

          {/* Type-specific fields */}
          {cardType === "character" ? (
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Role</label>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Courier, Fixer, Detective"
                className="h-9 w-full rounded border border-border-subtle bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan"
              />
            </div>
          ) : null}

          {cardType === "action" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Subject</label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Mira Vale"
                  className="h-9 w-full rounded border border-border-subtle bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Emotion</label>
                <input
                  value={emotion}
                  onChange={(event) => setEmotion(event.target.value)}
                  placeholder="e.g. alert, tense"
                  className="h-9 w-full rounded border border-border-subtle bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Action</label>
                <input
                  value={action}
                  onChange={(event) => setAction(event.target.value)}
                  placeholder="e.g. crosses the market while scanning for the signal"
                  className="h-9 w-full rounded border border-border-subtle bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Beat (what happens in this moment)</label>
                <textarea
                  value={beat}
                  onChange={(event) => setBeat(event.target.value)}
                  placeholder="e.g. Mira crosses the flooded night market while surveillance closes in."
                  className="min-h-16 w-full resize-y rounded border border-border-subtle bg-background p-2 text-sm text-text-primary outline-none focus:border-accent-cyan"
                />
              </div>
            </div>
          ) : null}

          {/* Description (for Style + Character) */}
          {cardType !== "action" ? (
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={cardType === "style" ? "e.g. Wet pavement, cyan signage, amber practicals, high-contrast night exteriors." : "e.g. Silver cropped hair, black raincoat, alert eyes, guarded posture."}
                className="min-h-16 w-full resize-y rounded border border-border-subtle bg-background p-2 text-sm text-text-primary outline-none focus:border-accent-cyan"
              />
            </div>
          ) : null}

          {/* Image upload (for Style + Character only — Action cards don't have images) */}
          {cardType !== "action" ? (
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.06em] text-text-muted">
                {cardType === "style" ? "Reference images" : "Portrait images"}
              </label>
              <label
                onDrop={onDrop}
                onDragOver={(event) => event.preventDefault()}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-dashed border-border-subtle bg-background px-3 text-center text-[11px] text-text-muted transition hover:border-accent-cyan hover:text-text-secondary"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files && event.target.files.length > 0) {
                      handleFiles(event.target.files)
                    }
                    event.target.value = ""
                  }}
                />
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Reading...</>
                ) : (
                  <><ImagePlus className="h-4 w-4" /> Drag image or click to upload</>
                )}
              </label>
              {uploadError ? (
                <p className="mt-1 text-[10px] text-accent-red">{uploadError}</p>
              ) : null}
              {uploadedImageUrls.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {uploadedImageUrls.map((url, index) => (
                    <div key={index} className="relative h-16 w-24 overflow-hidden rounded-sm border border-border-subtle">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: url.startsWith("data:") ? `url("${url}")` : url.startsWith("linear-gradient") ? url : `url("${url}")` }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white hover:bg-accent-red"
                        aria-label="Remove image"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[var(--radius-md)] border border-border-subtle px-3 py-2 text-xs text-text-secondary hover:bg-elevated"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-cyan px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Create card
          </button>
        </footer>
      </div>
    </div>
  )
}

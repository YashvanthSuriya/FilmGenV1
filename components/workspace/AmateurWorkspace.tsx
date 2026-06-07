"use client"

import { useMemo, type ReactNode } from "react"
import {
  Camera,
  Clapperboard,
  Film,
  Heart,
  Image as ImageIcon,
  MousePointer2,
  Plus,
  Sparkles,
  Video,
  type LucideIcon
} from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { AmateurWorkflowState, StyleCard, ActionCard } from "@/lib/types"

type ComposerModel = NonNullable<AmateurWorkflowState["model"]>
type ComposerDuration = NonNullable<AmateurWorkflowState["duration"]>
type ComposerQuality = NonNullable<AmateurWorkflowState["quality"]>
type ComposerReferences = NonNullable<AmateurWorkflowState["references"]>

const emptyReferences: ComposerReferences = []

const modelOptions: Array<{ value: ComposerModel; label: string; supports: Array<"image" | "video"> }> = [
  { value: "seedance-2", label: "Seedance 2.0", supports: ["video"] },
  { value: "kling", label: "Kling", supports: ["video"] },
  { value: "ray-3-14", label: "Ray 3.14", supports: ["image", "video"] },
  { value: "modify", label: "Modify", supports: ["image", "video"] }
]

const durationOptions: ComposerDuration[] = [5, 10, 15]
const qualityOptions: ComposerQuality[] = ["480p", "720p", "1080p"]

const imageReferences = [
  { name: "Uploaded image reference A", src: "demo://image/reference-a" },
  { name: "Uploaded image reference B", src: "demo://image/reference-b" },
  { name: "Uploaded image reference C", src: "demo://image/reference-c" }
]

const videoReferences = [
  { name: "Uploaded video reference A", src: "demo://video/reference-a" },
  { name: "Uploaded video reference B", src: "demo://video/reference-b" }
]

export function AmateurWorkspace({
  onModeChange,
  onAmateurChange
}: {
  onModeChange: (mode: "amateur" | "director") => void
  onAmateurChange: (patch: Partial<AmateurWorkflowState>) => void
}) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const actionCards = useProjectStore((state) => state.actionCards)
  const cameraConfig = useProjectStore((state) => state.cameraConfig)
  const addMediaClipToTimeline = useProjectStore((state) => state.addMediaClipToTimeline)
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const activeWorkspace = useWorkspaceStore((state) => state.workspaces.find((workspace) => workspace.id === activeWorkspaceId))
  const amateur = activeWorkspace?.amateur
  const styleCardId = amateur?.styleCardId ?? styleCards[0]?.id ?? ""
  const actionCardId = amateur?.actionCardId ?? actionCards[0]?.id ?? ""
  const prompt = amateur?.prompt ?? ""
  const outputType = amateur?.outputType ?? "video"
  const model = resolveModel(amateur?.model, outputType)
  const duration = amateur?.duration ?? 10
  const quality = amateur?.quality ?? "1080p"
  const references = amateur?.references ?? emptyReferences
  const selectedStyle = styleCards.find((style) => style.id === styleCardId)
  const selectedAction = actionCards.find((action) => action.id === actionCardId)

  const previewPrompt = useMemo(
    () =>
      [
        selectedStyle ? `Style: ${selectedStyle.name}. ${selectedStyle.description}` : "",
        selectedAction ? `Action: ${selectedAction.beat}` : "",
        `Output: ${outputType}`,
        `Model: ${model}`,
        `Duration: ${duration}s`,
        `Quality: ${quality}`,
        `Camera: ${cameraConfig.lens}, ${cameraConfig.movement}, ${cameraConfig.angle}`,
        references.length ? `References: ${references.map((item) => `${item.type}:${item.name}`).join(", ")}` : "",
        `Prompt: ${prompt}`
      ].filter(Boolean).join("\n"),
    [cameraConfig.angle, cameraConfig.lens, cameraConfig.movement, duration, model, outputType, prompt, quality, references, selectedAction, selectedStyle]
  )

  function patchComposer(patch: Partial<AmateurWorkflowState>) {
    onAmateurChange({
      camera: cameraConfig,
      outputType,
      prompt,
      model,
      duration,
      quality,
      references,
      ...patch
    })
  }

  function setOutputType(nextType: "image" | "video") {
    const nextReferences = nextType === "image" ? references.filter((item) => item.type === "image") : references
    patchComposer({
      outputType: nextType,
      model: resolveModel(model, nextType),
      references: nextReferences
    })
  }

  function addReference(type: "image" | "video") {
    if (type === "video" && outputType === "image") return
    const pool = type === "image" ? imageReferences : videoReferences
    const next = pool[references.filter((item) => item.type === type).length % pool.length]
    patchComposer({
      references: [
        ...references,
        {
          id: `${type}-${Date.now()}`,
          type,
          name: next.name,
          src: next.src
        }
      ]
    })
  }

  function removeReference(id: string) {
    patchComposer({ references: references.filter((item) => item.id !== id) })
  }

  return (
    <main className="relative h-[calc(100vh-var(--nav-height))] overflow-y-auto bg-[#030708] text-text-primary">
      <div className="pointer-events-none fixed inset-x-0 top-[var(--nav-height)] h-[520px] bg-[radial-gradient(circle_at_48%_25%,rgba(0,229,255,0.18),transparent_36%),radial-gradient(circle_at_42%_38%,rgba(71,111,255,0.18),transparent_28%),linear-gradient(180deg,rgba(4,16,20,0.92),rgba(3,7,8,0.4),transparent)]" />

      <aside className="fixed left-4 top-[calc(var(--nav-height)+28px)] z-30 hidden flex-col gap-4 md:flex">
        <ToolRailButton icon={MousePointer2} active label="Select" />
        <ToolRailButton icon={Plus} label="Add" />
        <ToolRailButton icon={ImageIcon} label="Image reference" onClick={() => addReference("image")} />
        <ToolRailButton icon={Clapperboard} label="Video reference" disabled={outputType === "image"} onClick={() => addReference("video")} />
      </aside>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-6 md:px-8 lg:px-12">
        <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-background/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <WorkspaceModeSwitch mode="amateur" onChange={onModeChange} />
            <div className="grid gap-3 md:grid-cols-2">
              <SelectionStrip
                label="Style"
                items={styleCards}
                selectedId={styleCardId}
                fallback="Style Auto"
                onSelect={(id) => patchComposer({ styleCardId: id })}
              />
              <ActionStrip
                label="Scene"
                items={actionCards}
                selectedId={actionCardId}
                fallback="Action Auto"
                onSelect={(id) => patchComposer({ actionCardId: id })}
              />
            </div>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-4 text-sm text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan">
              <Heart className="h-4 w-4" />
              Liked
            </button>
          </div>
        </section>

        <section className="grid min-h-[440px] place-items-center py-4 text-center">
          <div className="max-w-4xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">
              Cinema Studio 3.5
            </p>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[0.98] text-transparent md:text-6xl" style={{ backgroundImage: "linear-gradient(90deg,#4d7dff,#67e8f9)", WebkitBackgroundClip: "text" }}>
              What would you shoot with infinite budget?
            </h1>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <PromptChip icon={Sparkles} label={`Genre: ${selectedStyle?.mood?.split("/")[0]?.trim() ?? "General"}`} />
              <PromptChip icon={Film} label={`Style: ${selectedStyle?.name ?? "Auto"}`} />
              <PromptChip icon={Camera} label={`Camera: ${cameraConfig.lens}`} />
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface/90 p-4 shadow-lg shadow-black/30">
          <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
            <div className="grid gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-background/70 p-2">
              {(["image", "video"] as const).map((type) => {
                const Icon = type === "image" ? ImageIcon : Video
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOutputType(type)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border text-[10px] font-semibold uppercase transition ${outputType === type ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan shadow-cyan" : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-elevated hover:text-text-primary"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {type}
                  </button>
                )
              })}
            </div>

            <div className="grid gap-4">
              <textarea
                value={prompt}
                onChange={(event) => patchComposer({ prompt: event.target.value })}
                placeholder="Describe your scene - use @ to add characters, locations, props, and style notes"
                className="min-h-32 w-full resize-none rounded-[var(--radius-md)] border border-border-subtle bg-background/70 px-4 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-cyan"
              />

              <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                <div className="grid gap-3">
                  <ControlGroup label="Model">
                    {modelOptions.map((option) => {
                      const disabled = !option.supports.includes(outputType)
                      return (
                        <SegmentButton
                          key={option.value}
                          active={model === option.value}
                          disabled={disabled}
                          onClick={() => patchComposer({ model: option.value })}
                        >
                          {option.label}
                        </SegmentButton>
                      )
                    })}
                  </ControlGroup>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ControlGroup label="Timing">
                      {durationOptions.map((value) => (
                        <SegmentButton key={value} active={duration === value} onClick={() => patchComposer({ duration: value })}>
                          {value}s
                        </SegmentButton>
                      ))}
                    </ControlGroup>
                    <ControlGroup label="Quality">
                      {qualityOptions.map((value) => (
                        <SegmentButton key={value} active={quality === value} onClick={() => patchComposer({ quality: value })}>
                          {value}
                        </SegmentButton>
                      ))}
                    </ControlGroup>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addMediaClipToTimeline({
                      id: `amateur-${Date.now()}`,
                      type: outputType,
                      name: `${modelLabel(model)} ${outputType}`,
                      duration,
                      url: outputType === "image" ? "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,184,0,0.12))" : undefined
                    })
                  }
                  className="h-14 rounded-[var(--radius-md)] bg-accent-cyan px-6 font-heading text-xs font-bold uppercase tracking-[0.08em] text-black shadow-cyan transition hover:brightness-110"
                >
                  Prepare <Sparkles className="ml-1 inline h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
                <button type="button" onClick={() => addReference("image")} className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-background/70 px-3 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan">
                  <ImageIcon className="h-4 w-4" />
                  Add image
                </button>
                <button
                  type="button"
                  disabled={outputType === "image"}
                  onClick={() => addReference("video")}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-background/70 px-3 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:border-border-subtle disabled:text-text-muted disabled:opacity-45"
                >
                  <Video className="h-4 w-4" />
                  Add video
                </button>
                {outputType === "image" ? <span className="text-xs text-text-muted">Video references are unavailable in image mode.</span> : null}
                {references.map((reference) => (
                  <button
                    key={reference.id}
                    type="button"
                    onClick={() => removeReference(reference.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-accent-cyan bg-accent-cyan-dim px-3 text-xs text-accent-cyan transition hover:border-accent-cyan"
                  >
                    {reference.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                    {reference.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea readOnly value={previewPrompt} className="sr-only" aria-label="Assembled amateur prompt" />
        </section>
      </div>
    </main>
  )
}

function resolveModel(model: AmateurWorkflowState["model"], outputType: "image" | "video"): ComposerModel {
  const fallback = outputType === "image" ? "ray-3-14" : "seedance-2"
  const option = modelOptions.find((item) => item.value === model && item.supports.includes(outputType))
  return option?.value ?? fallback
}

function modelLabel(model: ComposerModel) {
  return modelOptions.find((item) => item.value === model)?.label ?? "Cinema Studio"
}

function WorkspaceModeSwitch({ mode, onChange }: { mode: "amateur" | "director"; onChange: (mode: "amateur" | "director") => void }) {
  return (
    <div className="inline-flex rounded-full border border-border-subtle bg-background/80 p-1 shadow-md backdrop-blur">
      {(["amateur", "director"] as const).map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} className={`h-9 rounded-full px-4 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] transition ${mode === item ? "bg-accent-cyan-dim text-accent-cyan shadow-cyan" : "text-text-secondary hover:text-text-primary"}`}>
          {item}
        </button>
      ))}
    </div>
  )
}

function SelectionStrip({
  label,
  items,
  selectedId,
  fallback,
  onSelect
}: {
  label: string
  items: StyleCard[]
  selectedId: string
  fallback: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.length === 0 ? (
          <span className="rounded-full border border-border-subtle bg-background/70 px-3 py-2 text-xs text-text-muted">{fallback}</span>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs transition ${selectedId === item.id ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-background/70 text-text-secondary hover:border-accent-cyan/60 hover:text-text-primary"}`}
            >
              {item.name}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function ActionStrip({
  label,
  items,
  selectedId,
  fallback,
  onSelect
}: {
  label: string
  items: ActionCard[]
  selectedId: string
  fallback: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.length === 0 ? (
          <span className="rounded-full border border-border-subtle bg-background/70 px-3 py-2 text-xs text-text-muted">{fallback}</span>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs transition ${selectedId === item.id ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-background/70 text-text-secondary hover:border-accent-cyan/60 hover:text-text-primary"}`}
            >
              {item.title}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function SegmentButton({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-9 rounded-full border px-3 text-xs transition ${active ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-background/70 text-text-secondary hover:border-accent-cyan/60 hover:text-text-primary"} disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-45 disabled:hover:border-border-subtle`}
    >
      {children}
    </button>
  )
}

function ToolRailButton({ icon: Icon, label, active = false, disabled = false, onClick }: { icon: LucideIcon; label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border bg-surface/80 text-text-secondary backdrop-blur transition ${active ? "border-white text-white shadow-md" : "border-border-subtle hover:border-accent-cyan hover:text-accent-cyan"} disabled:cursor-not-allowed disabled:opacity-45`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function PromptChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-3 text-xs text-text-secondary backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-accent-cyan" />
      {label}
    </span>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Music, Palette, SlidersHorizontal } from "lucide-react"
import { AudioStudioPanel } from "@/components/editing/audio/AudioStudioPanel"
import { ColorGradingPanel } from "@/components/editing/color/ColorGradingPanel"
import { TextOverlayEditor } from "@/components/editing/text/TextOverlayEditor"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { TimelineClip } from "@/lib/types"
import { formatTimecode } from "@/lib/editing/playback"

type InspectorTab = "clip" | "color" | "audio"

export function InspectorPanel() {
  const [tab, setTab] = useState<InspectorTab>("clip")
  const clips = useProjectStore((state) => state.editingState.clips)
  const selectedClipId = useProjectStore((state) => state.editingState.selectedClipId)
  const updateClip = useProjectStore((state) => state.updateTimelineClip)
  const clip = clips.find((item) => item.id === selectedClipId)

  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border-subtle bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-4">
        {tab === "audio" ? <Music className="h-4 w-4 text-accent-amber" /> : tab === "color" ? <Palette className="h-4 w-4 text-accent-cyan" /> : <SlidersHorizontal className="h-4 w-4 text-accent-cyan" />}
        <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Inspector</h2>
      </div>
      <div className="grid grid-cols-3 gap-1 border-b border-border-subtle bg-background p-2">
        <TabButton label="Clip" active={tab === "clip"} onClick={() => setTab("clip")} />
        <TabButton label="Color" active={tab === "color"} onClick={() => setTab("color")} />
        <TabButton label="Audio" active={tab === "audio"} onClick={() => setTab("audio")} />
      </div>
      {tab === "color" ? <ColorGradingPanel /> : null}
      {tab === "audio" ? <AudioStudioPanel /> : null}
      {tab === "clip" ? (
        clip ? (
          clip.type === "audio" ? (
            <AudioInspector clip={clip} onUpdate={(patch) => updateClip(clip.id, patch)} />
          ) : clip.type === "image" ? (
            <ImageInspector clip={clip} onUpdate={(patch) => updateClip(clip.id, patch)} />
          ) : clip.type === "video" ? (
            <VideoInspector clip={clip} onUpdate={(patch) => updateClip(clip.id, patch)} />
          ) : (
            <OverlayInspector clip={clip} onUpdate={(patch) => updateClip(clip.id, patch)} />
          )
        ) : (
          <div className="p-4 text-sm text-text-muted">Select a clip on the timeline to edit clip properties.</div>
        )
      ) : null}
    </aside>
  )
}

function ImageInspector({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <div className="space-y-5 p-4">
      <ClipSummary clip={clip} />
      <Field label="Name">
        <Input value={clip.name} onChange={(event) => onUpdate({ name: event.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Duration" value={clip.duration} min={0.25} max={600} step={0.25} onChange={(duration) => onUpdate({ duration, outPoint: duration })} />
        <NumberField label="Opacity" value={clip.opacity} min={0} max={100} onChange={(opacity) => onUpdate({ opacity })} />
        <NumberField label="Position X" value={clip.position.x} min={-1000} max={1000} onChange={(x) => onUpdate({ position: { ...clip.position, x } })} />
        <NumberField label="Position Y" value={clip.position.y} min={-1000} max={1000} onChange={(y) => onUpdate({ position: { ...clip.position, y } })} />
        <NumberField label="Scale" value={clip.scale} min={10} max={400} onChange={(scale) => onUpdate({ scale })} />
        <NumberField label="Rotation" value={clip.rotation} min={-180} max={180} onChange={(rotation) => onUpdate({ rotation })} />
      </div>
      <FitSelect clip={clip} onUpdate={onUpdate} />
      <VisualToggles clip={clip} onUpdate={onUpdate} />
    </div>
  )
}

function VideoInspector({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <div className="space-y-5 p-4">
      <ClipSummary clip={clip} />
      <Field label="Name">
        <Input value={clip.name} onChange={(event) => onUpdate({ name: event.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Speed" value={clip.speed} min={0.25} max={4} step={0.25} onChange={(speed) => onUpdate({ speed })} />
        <NumberField label="In Point" value={clip.inPoint} min={0} max={clip.outPoint - 0.25} step={0.25} onChange={(inPoint) => onUpdate({ inPoint })} />
        <NumberField label="Out Point" value={clip.outPoint} min={clip.inPoint + 0.25} max={600} step={0.25} onChange={(outPoint) => onUpdate({ outPoint, duration: Math.max(0.25, (outPoint - clip.inPoint) / clip.speed) })} />
        <NumberField label="Volume" value={clip.volume} min={0} max={100} onChange={(volume) => onUpdate({ volume })} />
        <NumberField label="Opacity" value={clip.opacity} min={0} max={100} onChange={(opacity) => onUpdate({ opacity })} />
        <NumberField label="Scale" value={clip.scale} min={10} max={400} onChange={(scale) => onUpdate({ scale })} />
        <NumberField label="Position X" value={clip.position.x} min={-1000} max={1000} onChange={(x) => onUpdate({ position: { ...clip.position, x } })} />
        <NumberField label="Position Y" value={clip.position.y} min={-1000} max={1000} onChange={(y) => onUpdate({ position: { ...clip.position, y } })} />
        <NumberField label="Rotation" value={clip.rotation} min={-180} max={180} onChange={(rotation) => onUpdate({ rotation })} />
      </div>
      <FitSelect clip={clip} onUpdate={onUpdate} />
      <VisualToggles clip={clip} onUpdate={onUpdate} />
    </div>
  )
}

function OverlayInspector({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <div className="space-y-5 p-4">
      <ClipSummary clip={clip} />
      <Field label="Name">
        <Input value={clip.name} onChange={(event) => onUpdate({ name: event.target.value })} />
      </Field>
      <NumberField label="Duration" value={clip.duration} min={0.25} max={600} step={0.25} onChange={(duration) => onUpdate({ duration, outPoint: duration })} />
      <VisualToggles clip={clip} onUpdate={onUpdate} />
    </div>
  )
}

function FitSelect({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <>
      <Field label="Blend Mode">
        <select className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm text-text-primary" value={clip.blendMode} onChange={(event) => onUpdate({ blendMode: event.target.value as TimelineClip["blendMode"] })}>
          <option value="normal">Normal</option>
          <option value="screen">Screen</option>
          <option value="multiply">Multiply</option>
          <option value="overlay">Overlay</option>
        </select>
      </Field>
      <Field label="Fit">
        <select className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm text-text-primary" value={clip.fit} onChange={(event) => onUpdate({ fit: event.target.value as TimelineClip["fit"] })}>
          <option value="contain">Fit</option>
          <option value="cover">Fill</option>
        </select>
      </Field>
    </>
  )
}

function VisualToggles({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Flip X" active={clip.flipX} onClick={() => onUpdate({ flipX: !clip.flipX })} />
        <Toggle label="Flip Y" active={clip.flipY} onClick={() => onUpdate({ flipY: !clip.flipY })} />
      </div>
      {clip.type === "overlay" ? <TextOverlayEditor clip={clip} /> : null}
    </>
  )
}

function AudioInspector({ clip, onUpdate }: { clip: TimelineClip; onUpdate: (patch: Partial<TimelineClip>) => void }) {
  return (
    <div className="space-y-5 p-4">
      <ClipSummary clip={clip} />
      <div className="grid h-16 place-items-center rounded-[var(--radius-md)] border border-accent-amber bg-[repeating-linear-gradient(90deg,rgba(255,184,0,0.16)_0_3px,rgba(255,184,0,0.04)_3px_9px)] text-xs text-accent-amber">
        Audio level preview
      </div>
      <NumberField label="Volume" value={clip.volume} min={0} max={100} onChange={(volume) => onUpdate({ volume })} />
      <NumberField label="Pan" value={clip.pan} min={-100} max={100} onChange={(pan) => onUpdate({ pan })} />
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Fade In" value={clip.fadeIn} min={0} max={clip.duration} step={0.1} onChange={(fadeIn) => onUpdate({ fadeIn })} />
        <NumberField label="Fade Out" value={clip.fadeOut} min={0} max={clip.duration} step={0.1} onChange={(fadeOut) => onUpdate({ fadeOut })} />
      </div>
    </div>
  )
}

function ClipSummary({ clip }: { clip: TimelineClip }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="aspect-video rounded bg-background" style={clip.thumbnailUrl ? { backgroundImage: `url(${clip.thumbnailUrl})`, backgroundSize: "cover" } : undefined} />
      <p className="mt-3 truncate font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">{clip.name}</p>
      <p className="mt-1 font-body text-xs text-text-muted">
        {formatTimecode(clip.inPoint)} - {formatTimecode(clip.outPoint)}
      </p>
      {clip.source ? <p className="mt-2 text-xs uppercase tracking-[0.08em] text-accent-cyan">Source: {clip.source}</p> : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-xs uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {children}
    </label>
  )
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  function commit(rawValue: string) {
    if (rawValue.trim() === "") return
    const nextValue = Number(rawValue)
    if (!Number.isFinite(nextValue)) return
    onChange(Math.min(max, Math.max(min, nextValue)))
  }

  return (
    <Field label={label}>
      <Input type="number" min={min} max={max} step={step} value={value} onChange={(event) => commit(event.target.value)} />
    </Field>
  )
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-9 rounded-[var(--radius-md)] border font-heading text-xs uppercase tracking-[0.08em] ${active ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border bg-elevated text-text-secondary"}`}>
      {label}
    </button>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-9 rounded-[var(--radius-md)] border font-heading text-xs uppercase tracking-[0.08em] ${active ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-elevated text-text-secondary hover:text-text-primary"}`}>
      {label}
    </button>
  )
}

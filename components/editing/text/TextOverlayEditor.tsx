"use client"

import type React from "react"
import { AlignCenter, AlignLeft, AlignRight, Type } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import { createDefaultTextOverlayClip } from "@/lib/editing/timeline"
import type { TextOverlayAnimation, TextOverlayClip, TimelineClip } from "@/lib/types"

const animations: TextOverlayAnimation[] = ["None", "Fade", "Slide In", "Typewriter", "Glow"]
const fonts: TextOverlayClip["fontFamily"][] = ["Syne", "DM Sans", "Custom"]

export function TextOverlayEditor({ clip }: { clip: TimelineClip }) {
  const overlay = useProjectStore((state) => state.editingState.textOverlays.clips.find((item) => item.clipId === clip.id)) ?? createDefaultTextOverlayClip(clip.id, clip.name)
  const update = useProjectStore((state) => state.updateTextOverlay)

  return (
    <section className="space-y-4 rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-accent-purple" />
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Text Overlay</p>
      </div>
      <textarea value={overlay.text} onChange={(event) => update(clip.id, { text: event.target.value })} className="min-h-20 w-full rounded-[var(--radius-md)] border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-accent-cyan" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Font">
          <select className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-text-primary" value={overlay.fontFamily} onChange={(event) => update(clip.id, { fontFamily: event.target.value as TextOverlayClip["fontFamily"] })}>
            {fonts.map((font) => <option key={font}>{font}</option>)}
          </select>
        </Field>
        <Field label="Size">
          <Input type="number" min={8} max={240} value={overlay.size} onChange={(event) => update(clip.id, { size: Number(event.target.value) })} />
        </Field>
      </div>
      {overlay.fontFamily === "Custom" ? (
        <Field label="Google Font">
          <Input value={overlay.customFont} onChange={(event) => update(clip.id, { customFont: event.target.value })} placeholder="Inter, Space Grotesk..." />
        </Field>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Color">
          <Input type="color" value={overlay.color} onChange={(event) => update(clip.id, { color: event.target.value })} />
        </Field>
        <Field label={`Opacity ${overlay.opacity}%`}>
          <Input type="range" min={0} max={100} value={overlay.opacity} onChange={(event) => update(clip.id, { opacity: Number(event.target.value) })} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <AlignButton active={overlay.alignment === "left"} label="Left" onClick={() => update(clip.id, { alignment: "left" })} icon={<AlignLeft className="h-4 w-4" />} />
        <AlignButton active={overlay.alignment === "center"} label="Center" onClick={() => update(clip.id, { alignment: "center" })} icon={<AlignCenter className="h-4 w-4" />} />
        <AlignButton active={overlay.alignment === "right"} label="Right" onClick={() => update(clip.id, { alignment: "right" })} icon={<AlignRight className="h-4 w-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Animation">
          <select className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-text-primary" value={overlay.animation} onChange={(event) => update(clip.id, { animation: event.target.value as TextOverlayAnimation })}>
            {animations.map((animation) => <option key={animation}>{animation}</option>)}
          </select>
        </Field>
        <Field label="Duration">
          <Input type="number" min={0} max={10} step={0.1} value={overlay.animationDuration} onChange={(event) => update(clip.id, { animationDuration: Number(event.target.value) })} />
        </Field>
      </div>
      <button type="button" onClick={() => update(clip.id, { safeAreaSnapping: !overlay.safeAreaSnapping })} className={`h-10 w-full rounded-[var(--radius-md)] border font-heading text-xs uppercase tracking-[0.08em] ${overlay.safeAreaSnapping ? "border-accent-purple bg-accent-purple-dim text-accent-purple" : "border-border text-text-secondary"}`}>
        Safe Area Snapping
      </button>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {children}
    </label>
  )
}

function AlignButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`grid h-10 place-items-center rounded-[var(--radius-md)] border ${active ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border text-text-secondary"}`}>
      {icon}
    </button>
  )
}

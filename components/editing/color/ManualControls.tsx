"use client"

import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { ColorManualControls } from "@/lib/types"

const controls: Array<{ key: keyof ColorManualControls; label: string; min: number; max: number; step?: number; suffix?: string }> = [
  { key: "exposure", label: "Exposure", min: -2, max: 2, step: 0.1, suffix: " stops" },
  { key: "contrast", label: "Contrast", min: -50, max: 50 },
  { key: "highlights", label: "Highlights", min: -100, max: 100 },
  { key: "shadows", label: "Shadows", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "temperature", label: "Temperature", min: 2000, max: 10000, step: 100, suffix: "K" },
  { key: "tint", label: "Tint", min: -50, max: 50 },
  { key: "filmGrain", label: "Film Grain", min: 0, max: 100, suffix: "%" },
  { key: "vignette", label: "Vignette", min: 0, max: 100, suffix: "%" }
]

export function ManualControls() {
  const manual = useProjectStore((state) => state.editingState.colorGrading.manual)
  const update = useProjectStore((state) => state.updateColorManualControls)

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Manual Controls</p>
      <div className="space-y-3">
        {controls.map((control) => (
          <label key={control.key} className="grid grid-cols-[96px_minmax(0,1fr)_56px] items-center gap-2">
            <span className="font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">{control.label}</span>
            <Input className="h-8" type="range" min={control.min} max={control.max} step={control.step ?? 1} value={manual[control.key]} onChange={(event) => update({ [control.key]: Number(event.target.value) })} />
            <span className="text-right text-xs text-text-secondary">{manual[control.key]}{control.suffix ?? ""}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

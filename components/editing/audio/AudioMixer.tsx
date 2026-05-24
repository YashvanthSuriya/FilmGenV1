"use client"

import { SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { AudioMixerState } from "@/lib/types"

const mixerControls: Array<{ key: keyof AudioMixerState; label: string; min: number; max: number; suffix?: string }> = [
  { key: "volumeAutomation", label: "Volume Automation", min: 0, max: 100, suffix: "%" },
  { key: "pan", label: "Panning L/R", min: -100, max: 100 },
  { key: "eqLow", label: "EQ Low", min: -12, max: 12, suffix: "dB" },
  { key: "eqMid", label: "EQ Mid", min: -12, max: 12, suffix: "dB" },
  { key: "eqHigh", label: "EQ High", min: -12, max: 12, suffix: "dB" },
  { key: "reverb", label: "Reverb", min: 0, max: 100, suffix: "%" },
  { key: "compression", label: "Compression", min: 0, max: 100, suffix: "%" },
  { key: "ducking", label: "Ducking", min: 0, max: 100, suffix: "%" }
]

export function AudioMixer() {
  const mixer = useProjectStore((state) => state.editingState.audioState.mixer)
  const update = useProjectStore((state) => state.updateAudioMixer)

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-accent-amber" />
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Mixer</p>
      </div>
      <div className="space-y-3">
        {mixerControls.map((control) => (
          <label key={control.key} className="grid grid-cols-[104px_minmax(0,1fr)_48px] items-center gap-2">
            <span className="font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">{control.label}</span>
            <Input className="h-8" type="range" min={control.min} max={control.max} value={mixer[control.key]} onChange={(event) => update({ [control.key]: Number(event.target.value) })} />
            <span className="text-right text-xs text-text-secondary">{mixer[control.key]}{control.suffix ?? ""}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

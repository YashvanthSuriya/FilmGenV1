"use client"

import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { FilmLutName } from "@/lib/types"

const luts: FilmLutName[] = ["Noir", "Teal/Orange", "Bleach Bypass", "Faded Film", "High Contrast", "Soft Glow", "Cyberpunk", "Vintage", "Natural"]

export function LUTSelector() {
  const lut = useProjectStore((state) => state.editingState.colorGrading.lut)
  const selectLut = useProjectStore((state) => state.selectLut)
  const setIntensity = useProjectStore((state) => state.setLutIntensity)

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">LUT Looks</p>
        <span className="text-xs text-text-muted">{lut.intensity}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {luts.map((name) => (
          <button key={name} type="button" onClick={() => selectLut(name)} className={`min-h-12 rounded-[var(--radius-md)] border px-2 text-center font-heading text-[10px] uppercase tracking-[0.08em] ${lut.name === name ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-background text-text-secondary hover:text-text-primary"}`}>
            {name}
          </button>
        ))}
      </div>
      <Input className="mt-3 h-8" type="range" min={0} max={100} value={lut.intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
    </section>
  )
}

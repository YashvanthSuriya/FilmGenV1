"use client"

import { useMemo } from "react"
import { useProjectStore } from "@/lib/stores/project"
import type { ColorPreviewMode } from "@/lib/types"

const modes: ColorPreviewMode[] = ["split", "after", "before"]

export function ColorGradingPreview() {
  const color = useProjectStore((state) => state.editingState.colorGrading)
  const setMode = useProjectStore((state) => state.setColorPreviewMode)

  const filter = useMemo(() => {
    const contrast = 100 + color.manual.contrast + color.lut.intensity * 0.12
    const saturate = 100 + color.manual.saturation + color.gain.saturation * 0.25
    const brightness = 100 + color.manual.exposure * 16 + color.gamma.luminance * 0.08
    const hue = color.manual.tint + color.lift.hue * 0.02
    return `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%) hue-rotate(${hue}deg)`
  }, [color])

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Preview</p>
        <div className="flex rounded-[var(--radius-md)] border border-border-subtle bg-background p-0.5">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode)}
              className={`h-7 rounded px-2 font-heading text-[10px] uppercase tracking-[0.08em] ${color.previewMode === mode ? "bg-accent-cyan text-black" : "text-text-muted hover:text-text-primary"}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="relative aspect-video overflow-hidden rounded border border-border-subtle bg-black">
        <MockFrame />
        {color.previewMode !== "before" ? (
          <div className={`absolute inset-0 ${color.previewMode === "split" ? "w-1/2 overflow-hidden border-r border-accent-cyan" : ""}`}>
            <div className="h-full w-full" style={{ filter }}>
              <MockFrame />
            </div>
          </div>
        ) : null}
        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 font-heading text-[10px] uppercase tracking-[0.08em] text-text-secondary">
          {color.lut.name} {color.lut.intensity}%
        </div>
      </div>
    </section>
  )
}

function MockFrame() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#202020_0%,#3e2f24_38%,#142a32_68%,#070707_100%)]">
      <div className="absolute left-[14%] top-[18%] h-[42%] w-[22%] rounded-full bg-accent-amber/25 blur-xl" />
      <div className="absolute bottom-[18%] right-[16%] h-[48%] w-[26%] rounded-full bg-accent-cyan/20 blur-xl" />
      <div className="absolute bottom-[20%] left-[24%] h-[36%] w-[52%] rounded bg-black/35" />
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { useProjectStore } from "@/lib/stores/project"
import type { ColorScopeType } from "@/lib/types"

const scopes: Array<{ key: ColorScopeType; label: string }> = [
  { key: "waveform", label: "Waveform" },
  { key: "vectorscope", label: "Vectorscope" },
  { key: "histogram", label: "Histogram" }
]

export function Scopes() {
  const color = useProjectStore((state) => state.editingState.colorGrading)
  const setScope = useProjectStore((state) => state.setActiveScope)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const width = canvas.width
    const height = canvas.height
    context.clearRect(0, 0, width, height)
    context.fillStyle = "#0d0d0d"
    context.fillRect(0, 0, width, height)
    context.strokeStyle = "#2f2f2f"
    for (let i = 0; i < 5; i += 1) {
      context.beginPath()
      context.moveTo(0, (i / 4) * height)
      context.lineTo(width, (i / 4) * height)
      context.stroke()
    }
    const seed = color.manual.exposure * 9 + color.manual.contrast + color.lut.intensity + color.gain.hue
    if (color.activeScope === "vectorscope") drawVectorscope(context, width, height, seed)
    else if (color.activeScope === "histogram") drawHistogram(context, width, height, seed)
    else drawWaveform(context, width, height, seed)
  }, [color])

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="mb-3 flex gap-1">
        {scopes.map((scope) => (
          <button key={scope.key} type="button" onClick={() => setScope(scope.key)} className={`h-8 flex-1 rounded border font-heading text-[10px] uppercase tracking-[0.08em] ${color.activeScope === scope.key ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle text-text-muted"}`}>
            {scope.label}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={272} height={120} className="h-[120px] w-full rounded border border-border-subtle" />
    </section>
  )
}

function drawWaveform(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  context.strokeStyle = "#00E5FF"
  for (let x = 0; x < width; x += 3) {
    const y = height * 0.5 + Math.sin(x * 0.05 + seed) * 32 + Math.cos(x * 0.018) * 14
    context.beginPath()
    context.moveTo(x, height)
    context.lineTo(x, Math.max(8, Math.min(height - 8, y)))
    context.stroke()
  }
}

function drawHistogram(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  ;["#FF4545", "#00FF94", "#00E5FF"].forEach((color, channel) => {
    context.fillStyle = color
    for (let x = 0; x < width; x += 8) {
      const bar = Math.abs(Math.sin(x * 0.026 + seed * 0.03 + channel)) * height * 0.75
      context.globalAlpha = 0.38
      context.fillRect(x, height - bar, 5, bar)
    }
  })
  context.globalAlpha = 1
}

function drawVectorscope(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  const cx = width / 2
  const cy = height / 2
  context.strokeStyle = "#444444"
  context.beginPath()
  context.arc(cx, cy, 42, 0, Math.PI * 2)
  context.stroke()
  for (let i = 0; i < 80; i += 1) {
    const angle = i * 0.42 + seed * 0.01
    const radius = 8 + Math.abs(Math.sin(i + seed)) * 40
    context.fillStyle = i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#FF4545" : "#00FF94"
    context.fillRect(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 2, 2)
  }
}

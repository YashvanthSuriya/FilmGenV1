"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { ColorWheelKey, ColorWheelValue } from "@/lib/types"

const wheels: Array<{ key: ColorWheelKey; label: string }> = [
  { key: "lift", label: "Lift" },
  { key: "gamma", label: "Gamma" },
  { key: "gain", label: "Gain" }
]

export function ColorWheels() {
  const color = useProjectStore((state) => state.editingState.colorGrading)
  const updateWheel = useProjectStore((state) => state.updateColorWheel)

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Color Wheels</p>
      <div className="grid grid-cols-3 gap-3">
        {wheels.map((wheel) => (
          <WheelControl key={wheel.key} label={wheel.label} value={color[wheel.key]} onChange={(value) => updateWheel(wheel.key, value)} />
        ))}
      </div>
    </section>
  )
}

function WheelControl({ label, value, onChange }: { label: string; value: ColorWheelValue; onChange: (value: Partial<ColorWheelValue>) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const size = canvas.width
    const radius = size / 2
    const image = context.createImageData(size, size)
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x - radius
        const dy = y - radius
        const distance = Math.sqrt(dx * dx + dy * dy)
        const index = (y * size + x) * 4
        if (distance > radius) {
          image.data[index + 3] = 0
          continue
        }
        const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360
        const saturation = Math.min(100, (distance / radius) * 100)
        const [r, g, b] = hslToRgb(hue, saturation, 50)
        image.data[index] = r
        image.data[index + 1] = g
        image.data[index + 2] = b
        image.data[index + 3] = 255
      }
    }
    context.putImageData(image, 0, 0)
    const markerRadius = (value.saturation / 100) * radius
    const angle = (value.hue * Math.PI) / 180
    context.beginPath()
    context.arc(radius + Math.cos(angle) * markerRadius, radius + Math.sin(angle) * markerRadius, 5, 0, Math.PI * 2)
    context.strokeStyle = "#f0f0f0"
    context.lineWidth = 2
    context.stroke()
  }, [value])

  function pick(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const radius = rect.width / 2
    const dx = event.clientX - rect.left - radius
    const dy = event.clientY - rect.top - radius
    const distance = Math.min(radius, Math.sqrt(dx * dx + dy * dy))
    onChange({
      hue: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
      saturation: (distance / radius) * 100
    })
  }

  return (
    <div className="min-w-0">
      <p className="mb-2 text-center font-heading text-[10px] uppercase tracking-[0.08em] text-text-secondary">{label}</p>
      <canvas ref={canvasRef} width={96} height={96} className="mx-auto aspect-square w-full rounded-full border border-border-subtle" onPointerDown={pick} onPointerMove={(event) => event.buttons === 1 && pick(event)} />
      <Input className="mt-2 h-8 text-xs" type="range" min={-100} max={100} value={value.luminance} onChange={(event) => onChange({ luminance: Number(event.target.value) })} />
    </div>
  )
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useProjectStore } from "@/lib/stores/project"
import type { CurveChannel, CurvePoint } from "@/lib/types"

const channels: Array<{ key: CurveChannel; label: string; color: string }> = [
  { key: "master", label: "M", color: "#f0f0f0" },
  { key: "red", label: "R", color: "#FF4545" },
  { key: "green", label: "G", color: "#00FF94" },
  { key: "blue", label: "B", color: "#00E5FF" }
]

export function CurvesEditor() {
  const [channel, setChannel] = useState<CurveChannel>("master")
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const curves = useProjectStore((state) => state.editingState.colorGrading.curves)
  const addPoint = useProjectStore((state) => state.addCurvePoint)
  const updatePoint = useProjectStore((state) => state.updateCurvePoint)
  const removePoint = useProjectStore((state) => state.removeCurvePoint)
  const active = curves[channel]

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
    context.lineWidth = 1
    for (let step = 0; step <= 4; step += 1) {
      const x = (step / 4) * width
      const y = (step / 4) * height
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }
    channels.forEach((item) => drawCurve(context, curves[item.key], width, height, item.key === channel ? item.color : "rgba(255,255,255,0.18)", item.key === channel ? 3 : 1))
    active.forEach((point) => {
      context.beginPath()
      context.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2)
      context.fillStyle = channels.find((item) => item.key === channel)?.color ?? "#f0f0f0"
      context.fill()
    })
  }, [active, channel, curves])

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    }
  }

  function hitPoint(point: { x: number; y: number }) {
    return active.find((item) => Math.abs(item.x - point.x) < 0.04 && Math.abs(item.y - point.y) < 0.08)
  }

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Curves</p>
        <div className="flex gap-1">
          {channels.map((item) => (
            <button key={item.key} type="button" onClick={() => setChannel(item.key)} className={`h-7 w-7 rounded border font-heading text-[10px] ${channel === item.key ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle text-text-muted"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={272}
        height={150}
        className="h-[150px] w-full rounded border border-border-subtle"
        onPointerDown={(event) => {
          const point = pointFromEvent(event)
          const hit = hitPoint(point)
          if (event.detail > 1 && hit) {
            if (hit.id !== "point-0" && hit.id !== "point-1") removePoint(channel, hit.id)
            return
          }
          if (hit) {
            event.currentTarget.setPointerCapture(event.pointerId)
            setDraggingId(hit.id)
          } else {
            addPoint(channel, point)
          }
        }}
        onPointerMove={(event) => {
          if (!draggingId || event.buttons !== 1) return
          const point = pointFromEvent(event)
          updatePoint(channel, draggingId, {
            ...point,
            x: draggingId === "point-0" ? 0 : draggingId === "point-1" ? 1 : point.x
          })
        }}
        onPointerUp={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
      />
    </section>
  )
}

function drawCurve(context: CanvasRenderingContext2D, points: CurvePoint[], width: number, height: number, color: string, lineWidth: number) {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  context.beginPath()
  sorted.forEach((point, index) => {
    const x = point.x * width
    const y = point.y * height
    if (index === 0) context.moveTo(x, y)
    else {
      const previous = sorted[index - 1]
      const cpX = ((previous.x + point.x) / 2) * width
      context.bezierCurveTo(cpX, previous.y * height, cpX, y, x, y)
    }
  })
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.stroke()
}

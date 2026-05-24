"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"
import { Copy, Scissors, Trash2, Unlink, Wand2, type LucideIcon } from "lucide-react"
import WaveSurfer from "wavesurfer.js"
import { useProjectStore } from "@/lib/stores/project"
import { transitionDefinitions } from "@/lib/editing/transitions"
import type { TimelineClip, TimelineTransitionType } from "@/lib/types"

const SECOND_WIDTH = 72

export function ClipBlock({ clip, left, width, zoom }: { clip: TimelineClip; left: number; width: number; zoom: number }) {
  const selectedClipId = useProjectStore((state) => state.editingState.selectedClipId)
  const selectClip = useProjectStore((state) => state.selectTimelineClip)
  const moveClip = useProjectStore((state) => state.moveTimelineClip)
  const trimClip = useProjectStore((state) => state.trimTimelineClip)
  const splitClip = useProjectStore((state) => state.splitTimelineClip)
  const duplicateClip = useProjectStore((state) => state.duplicateTimelineClip)
  const deleteClip = useProjectStore((state) => state.deleteTimelineClip)
  const applyTransition = useProjectStore((state) => state.applyTimelineTransition)
  const clips = useProjectStore((state) => state.editingState.clips)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const waveformRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (clip.type !== "audio" || !waveformRef.current) return undefined
    const wave = WaveSurfer.create({
      container: waveformRef.current,
      height: 34,
      waveColor: "rgba(255, 184, 0, 0.55)",
      progressColor: "#FFB800",
      cursorWidth: 0,
      interact: false
    })
    if (clip.url) void wave.load(clip.url)
    return () => wave.destroy()
  }, [clip.type, clip.url])

  useEffect(() => {
    if (!menu) return undefined
    function closeMenu(event: Event) {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-clip-menu]")) return
      setMenu(null)
    }
    function closeWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null)
    }
    window.addEventListener("mousedown", closeMenu)
    window.addEventListener("scroll", closeMenu, true)
    window.addEventListener("keydown", closeWithKeyboard)
    return () => {
      window.removeEventListener("mousedown", closeMenu)
      window.removeEventListener("scroll", closeMenu, true)
      window.removeEventListener("keydown", closeWithKeyboard)
    }
  }, [menu])

  const selected = selectedClipId === clip.id
  const clipClass =
    clip.type === "audio"
      ? "border-accent-amber bg-accent-amber-dim"
      : clip.type === "overlay"
        ? "border-accent-purple bg-elevated"
        : "border-l-accent-cyan bg-elevated"

  function beginMove(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).dataset.trim) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startY = event.clientY
    const originalStart = clip.start
    let didDrag = false
    const previousUserSelect = document.body.style.userSelect
    document.body.style.userSelect = "none"
    function move(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault()
      const distance = Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY)
      if (!didDrag && distance < 4) return
      didDrag = true
      const deltaSeconds = (pointerEvent.clientX - startX) / (SECOND_WIDTH * zoom)
      moveClip(clip.id, clip.trackId, originalStart + deltaSeconds)
    }
    function stop() {
      document.body.style.userSelect = previousUserSelect
      if (!didDrag) selectClip(clip.id)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  function beginTrim(edge: "start" | "end", event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.preventDefault()
    const startX = event.clientX
    const original = edge === "start" ? clip.start : clip.start + clip.duration
    const previousUserSelect = document.body.style.userSelect
    document.body.style.userSelect = "none"
    function move(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault()
      const deltaSeconds = (pointerEvent.clientX - startX) / (SECOND_WIDTH * zoom)
      trimClip(clip.id, edge, original + deltaSeconds)
    }
    function stop() {
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  function addTransition(type: TimelineTransitionType) {
    const next = clips
      .filter((item) => item.trackId === clip.trackId && item.start >= clip.start + clip.duration)
      .sort((a, b) => a.start - b.start)[0]
    if (next) applyTransition(clip.id, next.id, type)
    setMenu(null)
  }

  return (
    <>
      <div
        className={`absolute top-2 h-14 cursor-grab select-none overflow-hidden rounded-[var(--radius-md)] border border-l-4 px-3 py-2 text-left shadow-sm transition active:cursor-grabbing ${clipClass} ${selected ? "ring-2 ring-accent-cyan" : ""}`}
        style={{ left, width: Math.max(44, width) }}
        onPointerDown={beginMove}
        onContextMenu={(event) => {
          event.preventDefault()
          selectClip(clip.id)
          setMenu({ x: event.clientX, y: event.clientY })
        }}
      >
        <button data-trim="start" type="button" aria-label="Trim clip start" onPointerDown={(event) => beginTrim("start", event)} className="absolute inset-y-0 left-0 w-2 cursor-ew-resize bg-transparent hover:bg-accent-cyan/20" />
        <button data-trim="end" type="button" aria-label="Trim clip end" onPointerDown={(event) => beginTrim("end", event)} className="absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-transparent hover:bg-accent-cyan/20" />
        <div className="flex items-center gap-2">
          <p className="truncate font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">{clip.name}</p>
          {clip.source ? <span className="rounded-full bg-background px-1.5 py-0.5 text-[9px] uppercase text-text-muted">{clip.source}</span> : null}
        </div>
        {clip.type === "audio" ? (
          clip.url ? (
            <div ref={waveformRef} className="mt-1 h-8" />
          ) : (
            <div className="mt-1 h-7 rounded bg-[repeating-linear-gradient(90deg,rgba(255,184,0,0.25)_0_2px,transparent_2px_7px)]" />
          )
        ) : (
          <p className="mt-1 truncate text-xs text-text-muted">{clip.source ? `${clip.source} ` : ""}{clip.type} clip</p>
        )}
      </div>
      {menu ? (
        <div data-clip-menu className="fixed z-50 w-56 rounded-[var(--radius-md)] border border-border bg-overlay p-1 text-sm text-text-secondary shadow-lg" style={{ left: menu.x, top: menu.y }}>
          <MenuItem icon={Scissors} label="Split" onClick={() => { splitClip(clip.id, clip.start + clip.duration / 2); setMenu(null) }} />
          <MenuItem icon={Copy} label="Duplicate" onClick={() => { duplicateClip(clip.id); setMenu(null) }} />
          <MenuItem icon={Trash2} label="Delete" onClick={() => { deleteClip(clip.id); setMenu(null) }} />
          <MenuItem icon={Unlink} label="Detach Audio" onClick={() => setMenu(null)} />
          <div className="mt-1 border-t border-border-subtle pt-1">
            <div className="px-3 py-1 font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Transitions</div>
            {(Object.keys(transitionDefinitions) as TimelineTransitionType[]).map((type) => (
              <MenuItem key={type} icon={Wand2} label={transitionDefinitions[type].label} onClick={() => addTransition(type)} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-elevated hover:text-text-primary">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

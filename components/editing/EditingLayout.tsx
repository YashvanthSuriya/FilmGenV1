"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Columns3, Music, PanelBottom, PanelLeft, Palette, Settings2, Upload, X } from "lucide-react"
import { AudioStudioPanel } from "@/components/editing/audio/AudioStudioPanel"
import { ColorGradingPanel } from "@/components/editing/color/ColorGradingPanel"
import { ExportDemoPanel } from "@/components/editing/ExportDemoPanel"
import { InspectorPanel } from "@/components/editing/InspectorPanel"
import { MediaPanel } from "@/components/editing/MediaPanel"
import { PreviewPlayer } from "@/components/editing/PreviewPlayer"
import { Timeline } from "@/components/editing/Timeline"
import { TransportControls } from "@/components/editing/TransportControls"
import { useProjectStore } from "@/lib/stores/project"
import { TIMELINE_FPS, clampPlayhead, getTimelineDuration, nextPlaybackPosition, shouldRestartPlayback } from "@/lib/editing/playback"
import type { EditorToolWindow } from "@/lib/types"

const DEFAULT_MEDIA_WIDTH = 300
const DEFAULT_TIMELINE_HEIGHT = 190

export function EditingLayout() {
  const clips = useProjectStore((state) => state.editingState.clips)
  const playbackState = useProjectStore((state) => state.editingState.playbackState)
  const playheadPosition = useProjectStore((state) => state.editingState.playheadPosition)
  const playbackSpeed = useProjectStore((state) => state.editingState.playbackSpeed)
  const selectedToolWindow = useProjectStore((state) => state.editingState.selectedToolWindow)
  const setToolWindow = useProjectStore((state) => state.setEditorToolWindow)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const selectedClipId = useProjectStore((state) => state.editingState.selectedClipId)
  const deleteClip = useProjectStore((state) => state.deleteTimelineClip)
  const splitClip = useProjectStore((state) => state.splitTimelineClip)
  const duration = getTimelineDuration(clips)
  const playbackRef = useRef({ startedAt: 0, startPosition: 0 })
  const latestPlayheadRef = useRef(playheadPosition)
  const shellRef = useRef<HTMLElement>(null)
  const [mediaWidth, setMediaWidth] = useState(DEFAULT_MEDIA_WIDTH)
  const [timelineHeight, setTimelineHeight] = useState(DEFAULT_TIMELINE_HEIGHT)
  const [showMedia, setShowMedia] = useState(true)
  const [showTimeline, setShowTimeline] = useState(true)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    latestPlayheadRef.current = playheadPosition
  }, [playheadPosition])

  useEffect(() => {
    if (playbackState !== "playing") return undefined
    if (duration <= 0) {
      setPlaybackState("paused")
      setPlayheadPosition(0)
      return undefined
    }
    playbackRef.current = { startedAt: performance.now(), startPosition: Math.min(latestPlayheadRef.current, duration) }
    let frame = 0
    function tick(now: number) {
      const nextPosition = nextPlaybackPosition({
        startedAt: playbackRef.current.startedAt,
        startPosition: playbackRef.current.startPosition,
        now,
        speed: playbackSpeed,
        duration
      })
      if (nextPosition >= duration) {
        setPlayheadPosition(duration)
        setPlaybackState("paused")
        return
      }
      setPlayheadPosition(nextPosition)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, playbackSpeed, playbackState, setPlaybackState, setPlayheadPosition])

  useEffect(() => {
    function handleShortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      if (event.key === "Delete" || event.key === "Backspace") {
        if (!selectedClipId) return
        event.preventDefault()
        deleteClip(selectedClipId)
        return
      }
      if (event.key === " ") {
        event.preventDefault()
        if (playbackState === "playing") {
          setPlaybackState("paused")
          return
        }
        if (shouldRestartPlayback(playheadPosition, duration)) setPlayheadPosition(0)
        setPlaybackState("playing")
        return
      }
      if (event.key === "Home") {
        event.preventDefault()
        setPlayheadPosition(0)
        return
      }
      if (event.key === "End") {
        event.preventDefault()
        setPlayheadPosition(duration)
        return
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        setPlayheadPosition(clampPlayhead(playheadPosition + (event.key === "ArrowLeft" ? -1 : 1) / TIMELINE_FPS, duration))
        return
      }
      if (event.key.toLowerCase() === "s") {
        const clip = clips.find((item) => item.id === selectedClipId)
        if (!clip || playheadPosition <= clip.start || playheadPosition >= clip.start + clip.duration) return
        event.preventDefault()
        splitClip(clip.id, playheadPosition)
        return
      }
      if (event.key === "+" || event.key === "=" || event.key === "-") {
        event.preventDefault()
        useProjectStore.getState().setTimelineZoom(useProjectStore.getState().editingState.timelineZoom + (event.key === "-" ? -0.1 : 0.1))
      }
    }
    window.addEventListener("keydown", handleShortcuts)
    return () => window.removeEventListener("keydown", handleShortcuts)
  }, [clips, deleteClip, duration, playbackState, playheadPosition, selectedClipId, setPlaybackState, setPlayheadPosition, splitClip])

  function startResize(kind: "media" | "timeline", event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const shell = shellRef.current?.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startMedia = mediaWidth
    const startTimeline = timelineHeight
    const maxTimeline = shell ? Math.max(220, shell.height - 360) : 420

    function move(pointerEvent: PointerEvent) {
      if (kind === "media") setMediaWidth(Math.min(440, Math.max(240, startMedia + pointerEvent.clientX - startX)))
      if (kind === "timeline") setTimelineHeight(Math.min(maxTimeline, Math.max(130, startTimeline + startY - pointerEvent.clientY)))
    }
    function stop() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  return (
    <main
      ref={shellRef}
      className="grid h-[calc(100vh-var(--nav-height))] overflow-hidden bg-background"
      style={{
        gridTemplateColumns: showMedia ? `${mediaWidth}px 6px minmax(0,1fr)` : "minmax(0,1fr)",
        gridTemplateRows: showTimeline ? `minmax(0,1fr) 6px ${timelineHeight}px` : "minmax(0,1fr) 40px"
      }}
    >
      {showMedia ? <MediaPanel /> : null}
      {showMedia ? (
        <div className="cursor-col-resize border-r border-border-subtle bg-surface hover:bg-accent-cyan-dim" onPointerDown={(event) => startResize("media", event)} onDoubleClick={() => setMediaWidth(DEFAULT_MEDIA_WIDTH)} aria-hidden />
      ) : null}
      <section className="relative grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <EditorToolbar showMedia={showMedia} showTimeline={showTimeline} selectedToolWindow={selectedToolWindow} onToggleMedia={() => setShowMedia((value) => !value)} onToggleTimeline={() => setShowTimeline((value) => !value)} onTool={setToolWindow} onToggleExport={() => setShowExport((value) => !value)} />
        <PreviewPlayer duration={duration} />
        <TransportControls duration={duration} />
        <FloatingToolWindow tool={selectedToolWindow} duration={duration} onClose={() => setToolWindow(null)} />
        {showExport ? (
          <div className="absolute right-4 top-16 z-30 max-h-[70vh] w-[360px] overflow-auto rounded-[var(--radius-md)] border border-border bg-surface shadow-lg">
            <FloatingHeader title="Export" onClose={() => setShowExport(false)} />
            <ExportDemoPanel duration={duration} />
          </div>
        ) : null}
      </section>
      {showTimeline ? (
        <div className="col-span-full cursor-row-resize border-y border-border-subtle bg-surface hover:bg-accent-cyan-dim" onPointerDown={(event) => startResize("timeline", event)} onDoubleClick={() => setTimelineHeight(DEFAULT_TIMELINE_HEIGHT)} aria-hidden />
      ) : null}
      <section className="col-span-full min-h-0 overflow-hidden border-t border-border-subtle">
        {showTimeline ? <Timeline duration={duration} /> : (
          <button type="button" onClick={() => setShowTimeline(true)} className="flex h-10 w-full items-center justify-center gap-2 bg-surface font-heading text-xs uppercase tracking-[0.08em] text-text-secondary hover:text-accent-cyan">
            <PanelBottom className="h-4 w-4" />
            Show timeline
          </button>
        )}
      </section>
    </main>
  )
}

function EditorToolbar({ showMedia, showTimeline, selectedToolWindow, onToggleMedia, onToggleTimeline, onTool, onToggleExport }: { showMedia: boolean; showTimeline: boolean; selectedToolWindow: EditorToolWindow; onToggleMedia: () => void; onToggleTimeline: () => void; onTool: (tool: EditorToolWindow) => void; onToggleExport: () => void }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface px-3 py-1">
      <div className="flex gap-1">
        <ToolButton active={showMedia} icon={PanelLeft} label="Media" onClick={onToggleMedia} />
        <ToolButton active={showTimeline} icon={PanelBottom} label="Timeline" onClick={onToggleTimeline} />
        <ToolButton active={selectedToolWindow === "inspector"} icon={Settings2} label="Inspector" onClick={() => onTool(selectedToolWindow === "inspector" ? null : "inspector")} />
        <ToolButton active={selectedToolWindow === "color"} icon={Palette} label="Color" onClick={() => onTool(selectedToolWindow === "color" ? null : "color")} />
        <ToolButton active={selectedToolWindow === "audio"} icon={Music} label="Audio" onClick={() => onTool(selectedToolWindow === "audio" ? null : "audio")} />
        <ToolButton active={false} icon={Upload} label="Export" onClick={onToggleExport} />
      </div>
      <span className="hidden text-xs text-text-muted sm:inline">Preview-first 100% layout</span>
    </div>
  )
}

function ToolButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`flex h-8 items-center gap-2 rounded px-3 font-heading text-[10px] uppercase tracking-[0.08em] ${active ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:bg-elevated hover:text-text-primary"}`}>
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function FloatingToolWindow({ tool, duration, onClose }: { tool: EditorToolWindow; duration: number; onClose: () => void }) {
  if (!tool) return null
  const title = tool === "inspector" ? "Inspector" : tool === "color" ? "Color Grading" : "Audio"
  return (
    <div className={`absolute right-4 top-16 z-30 max-h-[calc(100%-5rem)] overflow-auto rounded-[var(--radius-md)] border border-border bg-surface shadow-lg ${tool === "color" ? "w-[min(760px,calc(100%-2rem))]" : "w-[min(420px,calc(100%-2rem))]"}`}>
      <FloatingHeader title={title} onClose={onClose} />
      {tool === "inspector" ? <InspectorPanel /> : null}
      {tool === "color" ? (
        <div className="grid gap-3 p-3 lg:grid-cols-[minmax(260px,1fr)_360px]">
          <div className="min-h-64 overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-black">
            <PreviewPlayer duration={duration} />
          </div>
          <ColorGradingPanel />
        </div>
      ) : null}
      {tool === "audio" ? <AudioStudioPanel /> : null}
    </div>
  )
}

function FloatingHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex h-10 items-center justify-between border-b border-border-subtle bg-surface px-3">
      <div className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">
        <Columns3 className="h-4 w-4 text-accent-cyan" />
        {title}
      </div>
      <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded text-text-secondary hover:bg-elevated hover:text-text-primary" aria-label={`Close ${title}`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ExportDemoPanel } from "@/components/editing/ExportDemoPanel"
import { InspectorPanel } from "@/components/editing/InspectorPanel"
import { MediaPanel } from "@/components/editing/MediaPanel"
import { PreviewPlayer } from "@/components/editing/PreviewPlayer"
import { Timeline } from "@/components/editing/Timeline"
import { TransportControls } from "@/components/editing/TransportControls"
import { useProjectStore } from "@/lib/stores/project"
import { TIMELINE_FPS, clampPlayhead, getTimelineDuration, nextPlaybackPosition, shouldRestartPlayback } from "@/lib/editing/playback"

const DEFAULT_MEDIA_WIDTH = 280
const DEFAULT_INSPECTOR_WIDTH = 320
const DEFAULT_TIMELINE_HEIGHT = 300

export function EditingLayout() {
  const clips = useProjectStore((state) => state.editingState.clips)
  const playbackState = useProjectStore((state) => state.editingState.playbackState)
  const playheadPosition = useProjectStore((state) => state.editingState.playheadPosition)
  const playbackSpeed = useProjectStore((state) => state.editingState.playbackSpeed)
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
  const [inspectorWidth, setInspectorWidth] = useState(DEFAULT_INSPECTOR_WIDTH)
  const [timelineHeight, setTimelineHeight] = useState(DEFAULT_TIMELINE_HEIGHT)

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

  function startResize(kind: "media" | "inspector" | "timeline", event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const shell = shellRef.current?.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startMedia = mediaWidth
    const startInspector = inspectorWidth
    const startTimeline = timelineHeight
    const maxTimeline = shell ? Math.max(240, shell.height - 320) : 520

    function move(pointerEvent: PointerEvent) {
      if (kind === "media") setMediaWidth(Math.min(420, Math.max(220, startMedia + pointerEvent.clientX - startX)))
      if (kind === "inspector") setInspectorWidth(Math.min(460, Math.max(260, startInspector + startX - pointerEvent.clientX)))
      if (kind === "timeline") setTimelineHeight(Math.min(maxTimeline, Math.max(220, startTimeline + startY - pointerEvent.clientY)))
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
      style={{ gridTemplateRows: `minmax(0,1fr) 6px ${timelineHeight}px` }}
    >
      <section
        className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(260px,1fr)_minmax(180px,auto)] border-b border-border-subtle lg:grid-rows-none lg:grid-cols-[var(--media-panel-width)_6px_minmax(360px,1fr)_6px_var(--inspector-panel-width)]"
        style={{
          "--media-panel-width": `${mediaWidth}px`,
          "--inspector-panel-width": `${inspectorWidth}px`
        } as React.CSSProperties}
      >
        <MediaPanel />
        <div
          className="hidden cursor-col-resize border-r border-border-subtle bg-surface hover:bg-accent-cyan-dim lg:block"
          onPointerDown={(event) => startResize("media", event)}
          onDoubleClick={() => setMediaWidth(DEFAULT_MEDIA_WIDTH)}
          aria-hidden
        />
        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(220px,1fr)_auto_auto] bg-background">
          <PreviewPlayer duration={duration} />
          <TransportControls duration={duration} />
          <ExportDemoPanel duration={duration} />
        </div>
        <div
          className="hidden cursor-col-resize border-l border-border-subtle bg-surface hover:bg-accent-cyan-dim lg:block"
          onPointerDown={(event) => startResize("inspector", event)}
          onDoubleClick={() => setInspectorWidth(DEFAULT_INSPECTOR_WIDTH)}
          aria-hidden
        />
        <InspectorPanel />
      </section>
      <div
        className="cursor-row-resize border-y border-border-subtle bg-surface hover:bg-accent-cyan-dim"
        onPointerDown={(event) => startResize("timeline", event)}
        onDoubleClick={() => setTimelineHeight(DEFAULT_TIMELINE_HEIGHT)}
        aria-hidden
      />
      <Timeline duration={duration} />
    </main>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import {
  Clock3,
  Copy,
  Film,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Scissors,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useProjectStore } from "@/lib/stores/project"
import type { ProjectAsset, TimelineClip, TimelineTransition, TimelineTransitionType } from "@/lib/types"
import { transitionDefinitions } from "@/lib/editor/transitions"

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function formatTimecode(seconds: number) {
  const safe = Math.max(0, seconds)
  const m = Math.floor(safe / 60)
  const s = Math.floor(safe % 60)
  const cs = Math.floor((safe - Math.floor(safe)) * 100)
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`
}

function getTimelineDuration(clips: TimelineClip[]) {
  return clips.reduce((duration, clip) => Math.max(duration, clip.start + clip.duration), 0)
}

function getAssetCounts(assets: ProjectAsset[]) {
  return assets.reduce<Record<ProjectAsset["type"], number>>(
    (counts, asset) => {
      counts[asset.type] += 1
      return counts
    },
    { image: 0, video: 0, audio: 0 }
  )
}

const DEFAULT_PPS = 24
const MIN_PPS = 8
const MAX_PPS = 96
const TRACK_HEADER_WIDTH = 120
const TRACK_HEIGHT = 56

export function EditorPlaceholder() {
  const projectName = useProjectStore((state) => state.projectName)
  const assets = useProjectStore((state) => state.assets)
  const editingState = useProjectStore((state) => state.editingState)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const selectTimelineClip = useProjectStore((state) => state.selectTimelineClip)
  const moveTimelineClip = useProjectStore((state) => state.moveTimelineClip)
  const trimTimelineClip = useProjectStore((state) => state.trimTimelineClip)
  const splitTimelineClip = useProjectStore((state) => state.splitTimelineClip)
  const deleteTimelineClip = useProjectStore((state) => state.deleteTimelineClip)
  const duplicateTimelineClip = useProjectStore((state) => state.duplicateTimelineClip)
  const updateTimelineClip = useProjectStore((state) => state.updateTimelineClip)
  const applyTimelineTransition = useProjectStore((state) => state.applyTimelineTransition)
  const removeTimelineTransition = useProjectStore((state) => state.removeTimelineTransition)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)

  const timelineDuration = useMemo(() => getTimelineDuration(editingState.clips), [editingState.clips])
  const assetCounts = useMemo(() => getAssetCounts(assets), [assets])
  const visibleTracks = editingState.tracks

  const [pps, setPps] = useState(DEFAULT_PPS)
  const [drag, setDrag] = useState<
    | { kind: "move"; clipId: string; origStart: number; trackId: string }
    | { kind: "trim"; clipId: string; edge: "start" | "end" }
    | null
  >(null)
  const [previewZoomed, setPreviewZoomed] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const timelineScrollRef = useRef<HTMLDivElement | null>(null)

  const timelineScale = Math.max(timelineDuration + 5, 15)
  const timelineWidth = timelineScale * pps

  const selectedClip = editingState.clips.find((c) => c.id === editingState.selectedClipId) ?? null

  // Real playback loop using requestAnimationFrame.
  useEffect(() => {
    if (editingState.playbackState !== "playing") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTickRef.current = 0
      return
    }
    const tick = (now: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = now
      const deltaSec = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      const next = editingState.playheadPosition + deltaSec * (editingState.playbackSpeed || 1)
      if (next >= timelineDuration) {
        setPlayheadPosition(timelineDuration)
        setPlaybackState("idle")
        return
      }
      setPlayheadPosition(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [editingState.playbackState, editingState.playheadPosition, editingState.playbackSpeed, timelineDuration, setPlayheadPosition, setPlaybackState])

  // Drag handlers
  useEffect(() => {
    if (!drag) return
    function onMove(event: globalThis.MouseEvent) {
      if (!drag) return
      const deltaSec = event.movementX / pps
      if (drag.kind === "move") {
        const source = editingState.clips.find((c) => c.id === drag.clipId)
        if (!source) return
        const nextStart = Math.max(0, source.start + deltaSec)
        moveTimelineClip(drag.clipId, drag.trackId, nextStart)
      } else if (drag.kind === "trim") {
        const source = editingState.clips.find((c) => c.id === drag.clipId)
        if (!source) return
        if (drag.edge === "start") {
          trimTimelineClip(drag.clipId, "start", source.start + deltaSec)
        } else {
          trimTimelineClip(drag.clipId, "end", source.start + source.duration + deltaSec)
        }
      }
    }
    function onUp() {
      setDrag(null)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [drag, editingState.clips, moveTimelineClip, trimTimelineClip, pps])

  function togglePlayback() {
    if (editingState.playbackState === "playing") {
      setPlaybackState("paused")
    } else if (editingState.playheadPosition >= timelineDuration) {
      setPlayheadPosition(0)
      setPlaybackState("playing")
    } else {
      setPlaybackState("playing")
    }
  }

  function jumpToStart() {
    setPlayheadPosition(0)
  }

  function jumpToEnd() {
    setPlayheadPosition(timelineDuration)
  }

  function onTimelineClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left + (timelineScrollRef.current?.scrollLeft ?? 0)
    const t = Math.max(0, x / pps)
    setPlayheadPosition(Math.min(t, timelineDuration))
    selectTimelineClip(null)
  }

  function startMove(event: MouseEvent<HTMLDivElement>, clip: TimelineClip) {
    event.stopPropagation()
    selectTimelineClip(clip.id)
    setDrag({ kind: "move", clipId: clip.id, origStart: clip.start, trackId: clip.trackId })
  }

  function startTrim(event: MouseEvent<HTMLDivElement>, clip: TimelineClip, edge: "start" | "end") {
    event.stopPropagation()
    event.preventDefault()
    selectTimelineClip(clip.id)
    setDrag({ kind: "trim", clipId: clip.id, edge })
  }

  function onSplitSelected() {
    if (!editingState.selectedClipId) return
    splitTimelineClip(editingState.selectedClipId, editingState.playheadPosition)
  }

  function onDeleteSelected() {
    if (!editingState.selectedClipId) return
    deleteTimelineClip(editingState.selectedClipId)
  }

  function onDuplicateSelected() {
    if (!editingState.selectedClipId) return
    duplicateTimelineClip(editingState.selectedClipId)
  }

  function zoomIn() { setPps((p) => Math.min(MAX_PPS, p + 8)) }
  function zoomOut() { setPps((p) => Math.max(MIN_PPS, p - 8)) }

  // Find the active clip under the playhead on the first non-overlay track (for preview)
  const previewClip = useMemo(() => {
    const videoClips = editingState.clips
      .filter((c) => c.type === "video" || c.type === "image")
      .sort((a, b) => a.start - b.start)
    for (const clip of videoClips) {
      if (editingState.playheadPosition >= clip.start && editingState.playheadPosition < clip.start + clip.duration) {
        return clip
      }
    }
    return videoClips.find((c) => c.start <= editingState.playheadPosition) ?? null
  }, [editingState.clips, editingState.playheadPosition])

  const previewAsset = previewClip?.assetId ? assets.find((a) => a.id === previewClip.assetId) : undefined
  const previewUrl = previewAsset?.url ?? previewClip?.url ?? previewAsset?.thumbnailUrl
  const previewStyle = previewUrl
    ? { backgroundImage: previewUrl.startsWith("linear-gradient") ? previewUrl : `url("${previewUrl}")` }
    : undefined

  const transitionsByFromId = useMemo(() => {
    const map = new Map<string, TimelineTransition>()
    for (const t of editingState.transitions) map.set(t.fromClipId, t)
    return map
  }, [editingState.transitions])

  return (
    <main className="flex min-h-[calc(100vh-var(--nav-height))] flex-col bg-background text-text-primary">
      {/* 3-pane layout: timeline bottom, preview + inspector on top row */}
      <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left column: preview + asset bin */}
        <section className="flex min-w-0 flex-col gap-3">
          {/* Preview surface */}
          <section className={`relative grid overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-[#050708] shadow-lg shadow-black/30 ${previewZoomed ? "min-h-[60vh]" : "min-h-[280px]"}`}>
            <div className="grid flex-1 place-items-center p-4 text-center">
              <div className="w-full max-w-3xl">
                <div
                  className="relative mx-auto grid aspect-video w-full max-w-2xl place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-cover bg-center"
                  style={previewStyle}
                >
                  {!previewUrl ? (
                    <div className="grid gap-3 text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[var(--radius-md)] border border-accent-cyan bg-accent-cyan-dim">
                        <Film className="h-7 w-7 text-accent-cyan" />
                      </div>
                      <p className="text-sm text-text-secondary">
                        {editingState.clips.length === 0 ? "Send a clip from the Workspace preview to start editing." : "Press play to preview the cut."}
                      </p>
                    </div>
                  ) : null}
                  {previewClip ? (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded bg-black/55 px-2 py-1 text-[10px] text-white">
                      <span className="truncate">{previewClip.name}</span>
                      <span className="font-mono">{formatTimecode(editingState.playheadPosition - previewClip.start)} / {formatTimecode(previewClip.duration)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Transport bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle p-2">
              <div className="flex items-center gap-1">
                <button type="button" onClick={jumpToStart} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Jump to start">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button type="button" onClick={togglePlayback} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-accent-cyan text-black transition hover:brightness-110" aria-label={editingState.playbackState === "playing" ? "Pause" : "Play"}>
                  {editingState.playbackState === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button type="button" onClick={jumpToEnd} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Jump to end">
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              <button type="button" onClick={onSplitSelected} disabled={!editingState.selectedClipId} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50" aria-label="Split at playhead" title="Split at playhead">
                <Scissors className="h-4 w-4" />
              </button>
              <button type="button" onClick={onDuplicateSelected} disabled={!editingState.selectedClipId} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50" aria-label="Duplicate selected" title="Duplicate selected">
                <Copy className="h-4 w-4" />
              </button>
              <button type="button" onClick={onDeleteSelected} disabled={!editingState.selectedClipId} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-muted transition hover:border-accent-red hover:text-accent-red disabled:cursor-not-allowed disabled:opacity-50" aria-label="Delete selected" title="Delete selected">
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Scrubber */}
              <div
                className="relative mx-1 h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-elevated"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const t = ((event.clientX - rect.left) / rect.width) * timelineDuration
                  setPlayheadPosition(Math.max(0, Math.min(t, timelineDuration)))
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-accent-cyan"
                  style={{ width: `${(editingState.playheadPosition / Math.max(1, timelineDuration)) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock3 className="h-3.5 w-3.5 text-accent-cyan" />
                <span className="font-mono">{formatTimecode(editingState.playheadPosition)} / {formatTimecode(timelineDuration)}</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewZoomed((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
                aria-label={previewZoomed ? "Shrink preview" : "Enlarge preview"}
                title={previewZoomed ? "Shrink preview" : "Enlarge preview"}
              >
                {previewZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </section>

          {/* Asset bin */}
          <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Project media</p>
                <h2 className="font-heading text-sm font-semibold text-text-primary">
                  {assets.length} asset{assets.length === 1 ? "" : "s"} ({assetCounts.image}i / {assetCounts.video}v / {assetCounts.audio}a)
                </h2>
              </div>
            </div>
            <div className="grid max-h-32 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {assets.length === 0 ? (
                <p className="col-span-full rounded border border-dashed border-border-subtle p-3 text-center text-[11px] text-text-muted">
                  No assets yet. Generate some in the Workspace.
                </p>
              ) : (
                assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => addAssetToTimeline(asset.id)}
                    className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-subtle bg-background p-1.5 text-left text-[11px] text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
                  >
                    <div
                      className="h-8 w-12 shrink-0 rounded-sm border border-border-subtle bg-cover bg-center"
                      style={{
                        backgroundImage: asset.thumbnailUrl?.startsWith("linear-gradient")
                          ? asset.thumbnailUrl
                          : asset.thumbnailUrl
                            ? `url("${asset.thumbnailUrl}")`
                            : undefined
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[11px]">{asset.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.06em] text-text-muted">{asset.type}{asset.duration ? ` · ${asset.duration}s` : ""}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </section>

        {/* Right column: inspector */}
        <aside className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-3 lg:max-h-[calc(100vh-var(--nav-height)-1.5rem)] lg:overflow-y-auto">
          <ClipInspector
            clip={selectedClip}
            asset={selectedClip?.assetId ? assets.find((a) => a.id === selectedClip.assetId) : undefined}
            clips={editingState.clips}
            transitions={editingState.transitions}
            onUpdate={updateTimelineClip}
            onApplyTransition={applyTimelineTransition}
            onRemoveTransition={removeTimelineTransition}
          />
        </aside>
      </div>

      {/* Timeline — full width, bottom */}
      <section className="rounded-t-[var(--radius-lg)] border-t border-border-subtle bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-2">
          <div>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Timeline</p>
            <h2 className="font-heading text-sm font-semibold text-text-primary">
              {editingState.clips.length} clip{editingState.clips.length === 1 ? "" : "s"} · {editingState.transitions.length} transition{editingState.transitions.length === 1 ? "" : "s"} · {formatDuration(timelineDuration)}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={zoomOut} disabled={pps <= MIN_PPS} className="grid h-8 w-8 place-items-center rounded border border-border-subtle bg-background text-text-secondary hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-40" aria-label="Zoom out" title="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-[10px] font-mono text-text-muted">{pps}px/s</span>
            <button type="button" onClick={zoomIn} disabled={pps >= MAX_PPS} className="grid h-8 w-8 place-items-center rounded border border-border-subtle bg-background text-text-secondary hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-40" aria-label="Zoom in" title="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div ref={timelineScrollRef} className="max-h-[40vh] overflow-auto px-3 pb-3">
          <div className="relative" style={{ width: TRACK_HEADER_WIDTH + timelineWidth, minWidth: "100%" }}>
            {/* Ruler */}
            <div className="sticky top-0 z-10 flex h-6 border-b border-border-subtle bg-surface">
              <div className="shrink-0 border-r border-border-subtle" style={{ width: TRACK_HEADER_WIDTH }} />
              <div className="relative" style={{ width: timelineWidth }}>
                {Array.from({ length: Math.ceil(timelineScale) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 flex h-full items-center text-[9px] text-text-muted"
                    style={{ left: i * pps }}
                  >
                    <span className="ml-1">{i}s</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracks */}
            <div className="relative" onClick={onTimelineClick}>
              {visibleTracks.map((track) => {
                const trackClips = editingState.clips.filter((c) => c.trackId === track.id)
                return (
                  <div key={track.id} className="relative flex border-b border-border-subtle" style={{ height: TRACK_HEIGHT }}>
                    <div className="flex shrink-0 items-center border-r border-border-subtle bg-background px-3" style={{ width: TRACK_HEADER_WIDTH }}>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-text-secondary">{track.name}</p>
                        <p className="text-[9px] uppercase tracking-[0.08em] text-text-muted">{track.type}</p>
                      </div>
                    </div>
                    <div className={`relative ${track.locked ? "opacity-50" : ""}`} style={{ width: timelineWidth, height: TRACK_HEIGHT }}>
                      {trackClips.length === 0 ? <div className="flex h-full items-center px-3 text-[10px] text-text-muted">Empty</div> : null}
                      {trackClips.map((clip) => {
                        const left = (clip.start / timelineScale) * timelineWidth
                        const width = Math.max(20, (clip.duration / timelineScale) * timelineWidth)
                        const isSelected = clip.id === editingState.selectedClipId
                        const transition = transitionsByFromId.get(clip.id)
                        return (
                          <div
                            key={clip.id}
                            onMouseDown={(event) => startMove(event, clip)}
                            className={`absolute top-2 flex h-12 cursor-grab items-center overflow-hidden rounded-[var(--radius-sm)] border px-2 text-xs active:cursor-grabbing ${
                              isSelected
                                ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
                                : "border-border bg-elevated text-text-secondary hover:border-accent-cyan/50"
                            }`}
                            style={{ left, width }}
                            title={clip.name}
                          >
                            <div onMouseDown={(event) => startTrim(event, clip, "start")} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-accent-cyan/40 hover:bg-accent-cyan" />
                            <span className="truncate pl-1.5 pr-1.5">{clip.name}</span>
                            {transition ? (
                              <span
                                className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-accent-amber px-1 py-0.5 text-[8px] uppercase tracking-[0.06em] text-black"
                                title={`${transitionDefinitions[transition.type].label} → next`}
                                onClick={(event) => { event.stopPropagation(); removeTimelineTransition(transition.id) }}
                              >
                                <Repeat className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                            <div onMouseDown={(event) => startTrim(event, clip, "end")} className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-accent-cyan/40 hover:bg-accent-cyan" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Playhead overlay */}
              <div
                className="pointer-events-none absolute top-0 z-20 w-0.5 bg-accent-red"
                style={{
                  left: TRACK_HEADER_WIDTH + (editingState.playheadPosition / timelineScale) * timelineWidth,
                  height: visibleTracks.length * TRACK_HEIGHT + 24
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ClipInspector({
  clip,
  asset,
  clips,
  transitions,
  onUpdate,
  onApplyTransition,
  onRemoveTransition
}: {
  clip: TimelineClip | null
  asset: ProjectAsset | undefined
  clips: TimelineClip[]
  transitions: TimelineTransition[]
  onUpdate: (clipId: string, patch: Partial<TimelineClip>) => void
  onApplyTransition: (fromClipId: string, toClipId: string, type: TimelineTransitionType) => void
  onRemoveTransition: (transitionId: string) => void
}) {
  if (!clip) {
    return (
      <div className="grid h-full min-h-[200px] place-items-center text-center">
        <div>
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-background text-text-muted">
            <Film className="h-5 w-5" />
          </div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">No clip selected</p>
          <p className="mt-1 text-[11px] text-text-muted">Click a clip on the timeline to inspect its properties.</p>
        </div>
      </div>
    )
  }

  const nextClip = clips
    .filter((c) => c.trackId === clip.trackId && c.start >= clip.start + clip.duration - 0.01)
    .sort((a, b) => a.start - b.start)[0]
  const existingTransition = transitions.find((t) => t.fromClipId === clip.id && t.toClipId === nextClip?.id)

  function NumberField({ label, value, onChange, min, max, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
    return (
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.06em] text-text-muted">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-8 w-full rounded border border-border-subtle bg-background px-2 text-xs text-text-primary outline-none focus:border-accent-cyan"
          />
          {suffix ? <span className="text-[10px] text-text-muted">{suffix}</span> : null}
        </div>
      </label>
    )
  }

  function RangeField({ label, value, onChange, min = 0, max = 100, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
    return (
      <label className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-muted">{label}</span>
          <span className="text-[10px] font-mono text-text-secondary">{value}{suffix}</span>
        </div>
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 w-full accent-[var(--accent-cyan)]"
        />
      </label>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Selected clip</p>
        <h3 className="mt-1 truncate font-heading text-base font-bold text-text-primary">{clip.name}</h3>
        <p className="text-[10px] uppercase tracking-[0.06em] text-text-muted">
          {clip.type} · {clip.trackId} · {formatTimecode(clip.start)} → {formatTimecode(clip.start + clip.duration)}
        </p>
        {asset ? (
          <div
            className="mt-2 h-16 w-full rounded-[var(--radius-sm)] border border-border-subtle bg-cover bg-center"
            style={{
              backgroundImage: asset.thumbnailUrl?.startsWith("linear-gradient")
                ? asset.thumbnailUrl
                : asset.thumbnailUrl
                  ? `url("${asset.thumbnailUrl}")`
                  : undefined
            }}
          />
        ) : null}
      </div>

      {/* Timing */}
      <div>
        <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Timing</p>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Start" value={Number(clip.start.toFixed(2))} onChange={(v) => onUpdate(clip.id, { start: Math.max(0, v) })} step={0.25} suffix="s" />
          <NumberField label="Duration" value={Number(clip.duration.toFixed(2))} onChange={(v) => onUpdate(clip.id, { duration: Math.max(0.25, v) })} step={0.25} suffix="s" />
        </div>
      </div>

      {/* Transform — video/image clips only */}
      {clip.type !== "audio" ? (
        <div>
          <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Transform</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Scale" value={clip.scale} onChange={(v) => onUpdate(clip.id, { scale: Math.max(0, v) })} min={0} max={400} step={1} suffix="%" />
            <NumberField label="Rotation" value={clip.rotation} onChange={(v) => onUpdate(clip.id, { rotation: v })} min={-180} max={180} step={1} suffix="°" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <RangeField label="Opacity" value={clip.opacity} onChange={(v) => onUpdate(clip.id, { opacity: v })} suffix="%" />
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => onUpdate(clip.id, { flipX: !clip.flipX })} className={`flex-1 rounded border px-2 py-1 text-[10px] ${clip.flipX ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle text-text-muted hover:text-text-secondary"}`}>Flip X</button>
            <button type="button" onClick={() => onUpdate(clip.id, { flipY: !clip.flipY })} className={`flex-1 rounded border px-2 py-1 text-[10px] ${clip.flipY ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle text-text-muted hover:text-text-secondary"}`}>Flip Y</button>
          </div>
        </div>
      ) : null}

      {/* Audio — for clips with sound */}
      <div>
        <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Audio</p>
        <RangeField label="Volume" value={clip.volume} onChange={(v) => onUpdate(clip.id, { volume: v })} max={200} suffix="%" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField label="Fade in" value={clip.fadeIn} onChange={(v) => onUpdate(clip.id, { fadeIn: Math.max(0, v) })} min={0} step={0.1} suffix="s" />
          <NumberField label="Fade out" value={clip.fadeOut} onChange={(v) => onUpdate(clip.id, { fadeOut: Math.max(0, v) })} min={0} step={0.1} suffix="s" />
        </div>
      </div>

      {/* Transition to next clip */}
      {nextClip ? (
        <div>
          <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Transition → {nextClip.name}</p>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(transitionDefinitions) as TimelineTransitionType[]).map((type) => {
              const isActive = existingTransition?.type === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onApplyTransition(clip.id, nextClip.id, type)}
                  className={`rounded-full border px-2 py-1 text-[10px] transition ${isActive ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"}`}
                >
                  {transitionDefinitions[type].label}
                </button>
              )
            })}
          </div>
          {existingTransition ? (
            <button type="button" onClick={() => onRemoveTransition(existingTransition.id)} className="mt-2 rounded-full border border-accent-red/40 px-2 py-1 text-[10px] text-accent-red hover:bg-accent-red-dim">
              Remove transition
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Maximize2, Minus, Plus } from "lucide-react"
import { TrackHeader } from "@/components/editing/TrackHeader"
import { ClipBlock } from "@/components/editing/ClipBlock"
import { TransitionOverlay } from "@/components/editing/TransitionOverlay"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import { clampPlayhead, formatTimecode } from "@/lib/editing/playback"
import type { ProjectAsset, TimelineTrack } from "@/lib/types"

const SECOND_WIDTH = 72
const TRACK_HEIGHT = 72

export function Timeline({ duration }: { duration: number }) {
  const [dragState, setDragState] = useState<{ trackId: string; compatible: boolean; hint: string } | null>(null)
  const [dropStatus, setDropStatus] = useState<string | null>(null)
  const editing = useProjectStore((state) => state.editingState)
  const assets = useProjectStore((state) => state.assets)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setTimelineZoom = useProjectStore((state) => state.setTimelineZoom)
  const orderedTracks = useMemo(() => [...editing.tracks].sort((a, b) => a.order - b.order), [editing.tracks])
  const displayDuration = Math.max(10, duration)
  const timelineWidth = Math.max(900, displayDuration * SECOND_WIDTH * editing.timelineZoom)

  function seekFromEvent(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    setPlayheadPosition(clampPlayhead(x / (SECOND_WIDTH * editing.timelineZoom), duration))
  }

  function fitTimeline() {
    const viewport = document.querySelector("[data-timeline-scroll]")?.clientWidth ?? 900
    const nextZoom = Math.max(0.5, Math.min(3, viewport / Math.max(1, displayDuration * SECOND_WIDTH)))
    setTimelineZoom(nextZoom)
  }

  function getDragPayload(dataTransfer: DataTransfer) {
    const assetId = dataTransfer.getData("application/x-cine-asset") || dataTransfer.getData("text/plain")
    return { assetId }
  }

  function isTrackCompatible(track: TimelineTrack, payload: { assetId: string }) {
    if (track.locked) return false
    if (payload.assetId) {
      const asset = assets.find((item) => item.id === payload.assetId)
      return asset ? isVisualOrAudioCompatible(track, asset) : false
    }
    return false
  }

  function getDropHint(track: TimelineTrack, compatible: boolean) {
    if (compatible) return track.type === "audio" ? "Drop audio here" : "Drop image/video here"
    if (track.locked) return "Track is locked"
    return track.type === "audio" ? "Drop audio on audio tracks" : "Drop image/video on video tracks"
  }

  function handleTimelineDrop(track: TimelineTrack, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragState(null)
    const payload = getDragPayload(event.dataTransfer)
    if (!payload.assetId) return
    const compatible = isTrackCompatible(track, payload)
    if (!compatible) {
      setDropStatus(getDropHint(track, false))
      window.setTimeout(() => setDropStatus(null), 1800)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const start = Math.max(0, (event.clientX - rect.left) / (SECOND_WIDTH * editing.timelineZoom))
    const asset = assets.find((item) => item.id === payload.assetId)
    if (!asset) {
      setDropStatus("Media asset not found")
    } else {
      addAssetToTimeline(asset.id, track.id, start)
      setDropStatus(`${asset.type === "audio" ? "Audio" : "Visual"} added`)
    }
    window.setTimeout(() => setDropStatus(null), 1800)
  }

  return (
    <section
      className="relative min-h-0 overflow-hidden bg-background"
      onWheel={(event) => {
        if (!event.ctrlKey) return
        event.preventDefault()
        setTimelineZoom(editing.timelineZoom + (event.deltaY > 0 ? -0.1 : 0.1))
      }}
    >
      <div className="flex h-full overflow-auto" data-timeline-scroll>
        <div className="sticky left-0 z-30 w-[var(--timeline-header-width)] shrink-0 border-r border-border-subtle bg-surface">
          <div className="flex h-10 items-center justify-between gap-1 border-b border-border-subtle px-2 py-1">
            <span className="font-heading text-xs uppercase tracking-[0.08em] text-text-muted">Tracks</span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Zoom out timeline" onClick={() => setTimelineZoom(editing.timelineZoom - 0.1)}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Fit timeline" onClick={fitTimeline}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Zoom in timeline" onClick={() => setTimelineZoom(editing.timelineZoom + 0.1)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {orderedTracks.map((track) => (
            <div key={track.id} style={{ height: track.expanded ? TRACK_HEIGHT : 44 }}>
              <TrackHeader track={track} />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-10 border-b border-border-subtle bg-surface" style={{ width: timelineWidth }} onPointerDown={seekFromEvent}>
            {Array.from({ length: Math.ceil(displayDuration) + 1 }).map((_, second) => (
              <div key={second} className="absolute top-0 h-full border-l border-border-subtle px-1 pt-1 font-body text-[10px] text-text-muted" style={{ left: second * SECOND_WIDTH * editing.timelineZoom }}>
                {second % 5 === 0 ? formatTimecode(second).slice(3) : ""}
              </div>
            ))}
            <div className="absolute top-0 z-20 h-full w-0.5 bg-accent-red" style={{ left: editing.playheadPosition * SECOND_WIDTH * editing.timelineZoom }} />
          </div>

          <div className="relative" style={{ width: timelineWidth }}>
            <div className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-accent-red" style={{ left: editing.playheadPosition * SECOND_WIDTH * editing.timelineZoom }} />
            {orderedTracks.map((track) => {
              const trackClips = editing.clips.filter((clip) => clip.trackId === track.id)
              const trackHeight = track.expanded ? TRACK_HEIGHT : 40
              return (
                <div
                  key={track.id}
                  className="relative border-b border-border-subtle bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]"
                  style={{ height: trackHeight, backgroundSize: `${SECOND_WIDTH * editing.timelineZoom}px 100%` }}
                  onDragEnter={(event) => {
                    const payload = getDragPayload(event.dataTransfer)
                    if (payload.assetId) {
                      const compatible = isTrackCompatible(track, payload)
                      setDragState({ trackId: track.id, compatible, hint: getDropHint(track, compatible) })
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragState(null)
                  }}
                  onDragOver={(event) => {
                    const payload = getDragPayload(event.dataTransfer)
                    if (!payload.assetId) return
                    event.preventDefault()
                    const compatible = isTrackCompatible(track, payload)
                    event.dataTransfer.dropEffect = compatible ? "copy" : "none"
                    if (dragState?.trackId !== track.id || dragState.compatible !== compatible) {
                      setDragState({ trackId: track.id, compatible, hint: getDropHint(track, compatible) })
                    }
                  }}
                  onDrop={(event) => handleTimelineDrop(track, event)}
                >
                  {dragState?.trackId === track.id ? (
                    <div className={`pointer-events-none absolute inset-1 z-10 grid place-items-center rounded border text-[10px] uppercase tracking-[0.08em] ${dragState.compatible ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-accent-red bg-accent-red/10 text-accent-red"}`}>
                      {dragState.hint}
                    </div>
                  ) : null}
                  {trackClips.map((clip) => (
                    <ClipBlock
                      key={clip.id}
                      clip={clip}
                      left={clip.start * SECOND_WIDTH * editing.timelineZoom}
                      width={clip.duration * SECOND_WIDTH * editing.timelineZoom}
                      zoom={editing.timelineZoom}
                    />
                  ))}
                  {editing.transitions
                    .filter((transition) => trackClips.some((clip) => clip.id === transition.fromClipId))
                    .map((transition) => {
                      const from = editing.clips.find((clip) => clip.id === transition.fromClipId)
                      if (!from) return null
                      return <TransitionOverlay key={transition.id} transition={transition} left={(from.start + from.duration) * SECOND_WIDTH * editing.timelineZoom} />
                    })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {dropStatus ? <div className="pointer-events-none absolute bottom-3 right-3 z-40 rounded bg-black/80 px-3 py-2 text-xs text-text-secondary">{dropStatus}</div> : null}
    </section>
  )
}

function isVisualOrAudioCompatible(track: TimelineTrack, asset: ProjectAsset) {
  if (asset.type === "audio") return track.type === "audio"
  return track.type === "video"
}

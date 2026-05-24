"use client"

import type React from "react"
import { useMemo } from "react"
import { TrackHeader } from "@/components/editing/TrackHeader"
import { ClipBlock } from "@/components/editing/ClipBlock"
import { TransitionOverlay } from "@/components/editing/TransitionOverlay"
import { useProjectStore } from "@/lib/stores/project"
import { formatTimecode } from "@/lib/editing/playback"
import { createObjectUrlForBlobKey } from "@/lib/media/indexedDb"
import type { SfxItem } from "@/lib/types"

const SECOND_WIDTH = 72
const TRACK_HEIGHT = 72

export function Timeline({ duration }: { duration: number }) {
  const editing = useProjectStore((state) => state.editingState)
  const assets = useProjectStore((state) => state.assets)
  const addMediaClipToTimeline = useProjectStore((state) => state.addMediaClipToTimeline)
  const addAssetToTimeline = useProjectStore((state) => state.addAssetToTimeline)
  const addMockSfxToTimeline = useProjectStore((state) => state.addMockSfxToTimeline)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setTimelineZoom = useProjectStore((state) => state.setTimelineZoom)
  const orderedTracks = useMemo(() => [...editing.tracks].sort((a, b) => a.order - b.order), [editing.tracks])
  const displayDuration = Math.max(10, duration)
  const timelineWidth = Math.max(900, displayDuration * SECOND_WIDTH * editing.timelineZoom)

  function seekFromEvent(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    setPlayheadPosition(Math.min(duration, Math.max(0, x / (SECOND_WIDTH * editing.timelineZoom))))
  }

  return (
    <section
      className="min-h-0 overflow-hidden bg-background"
      onWheel={(event) => {
        if (!event.ctrlKey) return
        event.preventDefault()
        setTimelineZoom(editing.timelineZoom + (event.deltaY > 0 ? -0.1 : 0.1))
      }}
    >
      <div className="flex h-full overflow-auto">
        <div className="sticky left-0 z-30 w-[var(--timeline-header-width)] shrink-0 border-r border-border-subtle bg-surface">
          <div className="h-10 border-b border-border-subtle px-3 py-2 font-heading text-xs uppercase tracking-[0.08em] text-text-muted">Tracks</div>
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
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    const mediaId = event.dataTransfer.getData("application/x-cine-media")
                    const assetId = event.dataTransfer.getData("application/x-cine-asset")
                    const sfxPayload = event.dataTransfer.getData("application/x-cine-sfx")
                    if (!mediaId && !assetId && !sfxPayload) return
                    const rect = event.currentTarget.getBoundingClientRect()
                    const start = (event.clientX - rect.left) / (SECOND_WIDTH * editing.timelineZoom)
                    if (sfxPayload) {
                      try {
                        addMockSfxToTimeline(JSON.parse(sfxPayload) as SfxItem, start)
                      } catch {
                        // Ignore malformed drag payloads from outside the app.
                      }
                    } else if (assetId) {
                      const asset = assets.find((item) => item.id === assetId)
                      void createObjectUrlForBlobKey(asset?.blobKey).then((url) => addAssetToTimeline(assetId, track.id, start, url))
                    } else {
                      addMediaClipToTimeline(mediaId, track.id, start)
                    }
                  }}
                >
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
    </section>
  )
}

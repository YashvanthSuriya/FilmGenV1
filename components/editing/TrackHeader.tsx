"use client"

import type React from "react"
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Lock, Music, Shield, Video, Volume2, VolumeX } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import type { TimelineTrack } from "@/lib/types"

function TrackIcon({ type }: { type: TimelineTrack["type"] }) {
  if (type === "audio") return <Music className="h-4 w-4 text-accent-amber" />
  if (type === "overlay") return <Shield className="h-4 w-4 text-accent-purple" />
  return <Video className="h-4 w-4 text-accent-cyan" />
}

export function TrackHeader({ track }: { track: TimelineTrack }) {
  const renameTrack = useProjectStore((state) => state.renameTrack)
  const toggleTrack = useProjectStore((state) => state.toggleTrack)
  const reorderTimelineTracks = useProjectStore((state) => state.reorderTimelineTracks)

  return (
    <div
      className="grid h-full w-[var(--timeline-header-width)] shrink-0 grid-cols-[22px_1fr] gap-2 border-r border-border-subtle bg-surface p-2"
      draggable
      onDragStart={(event) => event.dataTransfer.setData("application/x-cine-track", track.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const activeId = event.dataTransfer.getData("application/x-cine-track")
        if (activeId) reorderTimelineTracks(activeId, track.id)
      }}
    >
      <div className="flex items-center justify-center text-text-muted">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => toggleTrack(track.id, "expanded")} className="text-text-muted hover:text-accent-cyan" aria-label="Expand track">
            {track.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <TrackIcon type={track.type} />
          <input
            className="min-w-0 flex-1 bg-transparent font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary outline-none"
            value={track.name}
            onChange={(event) => renameTrack(track.id, event.target.value)}
            aria-label={`${track.name} name`}
          />
        </div>
        <div className="mt-1.5 flex gap-1">
          {track.type === "audio" ? (
            <>
              <TrackButton active={track.muted} onClick={() => toggleTrack(track.id, "muted")} label="Mute">
                {track.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </TrackButton>
              <TrackButton active={track.solo} onClick={() => toggleTrack(track.id, "solo")} label="Solo">S</TrackButton>
            </>
          ) : (
            <TrackButton active={track.muted} onClick={() => toggleTrack(track.id, "muted")} label={track.type === "overlay" ? "Hide overlay" : "Hide video"}>
              {track.muted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </TrackButton>
          )}
          <TrackButton active={track.locked} onClick={() => toggleTrack(track.id, "locked")} label="Lock">
            <Lock className="h-3.5 w-3.5" />
          </TrackButton>
        </div>
      </div>
    </div>
  )
}

function TrackButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-6 min-w-6 place-items-center rounded border px-1.5 font-heading text-xs ${active ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border-subtle bg-elevated text-text-muted hover:text-text-primary"}`}
    >
      {children}
    </button>
  )
}

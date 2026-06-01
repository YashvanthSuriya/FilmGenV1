"use client"

import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import { TIMELINE_FPS, clampPlayhead, formatTimecode, parseTimecode, shouldRestartPlayback } from "@/lib/editing/playback"

const speeds = [0.25, 0.5, 1, 1.5, 2]

export function TransportControls({ duration }: { duration: number }) {
  const editing = useProjectStore((state) => state.editingState)
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setPlaybackSpeed = useProjectStore((state) => state.setPlaybackSpeed)
  const setTimelineVolume = useProjectStore((state) => state.setTimelineVolume)
  const setPreviewMuted = useProjectStore((state) => state.setPreviewMuted)
  const setPreviewVolume = useProjectStore((state) => state.setPreviewVolume)
  const playing = editing.playbackState === "playing"

  function commitTimecode(value: string) {
    const seconds = parseTimecode(value)
    if (seconds !== null) setPlayheadPosition(clampPlayhead(seconds, duration))
  }

  function togglePlayback() {
    if (playing) {
      setPlaybackState("paused")
      return
    }
    if (shouldRestartPlayback(editing.playheadPosition, duration)) setPlayheadPosition(0)
    setPlaybackState("playing")
  }

  return (
    <section className="flex min-h-0 flex-wrap items-center justify-center gap-1.5 overflow-hidden border-b border-border-subtle bg-surface px-2 py-1.5 shadow-md">
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border-subtle bg-background p-1">
        <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(0)} aria-label="Back to start">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(clampPlayhead(editing.playheadPosition - 1 / TIMELINE_FPS, duration))} aria-label="Previous frame">
          <StepBack className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="primary" onClick={togglePlayback} disabled={duration <= 0} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(clampPlayhead(editing.playheadPosition + 1 / TIMELINE_FPS, duration))} aria-label="Next frame">
          <StepForward className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(duration)} aria-label="End">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-background p-1">
        <Input
          className="h-8 w-24 font-body text-xs"
          value={formatTimecode(editing.playheadPosition)}
          onChange={(event) => commitTimecode(event.target.value)}
          aria-label="Current timecode"
        />
        <span className="font-body text-xs text-text-muted">/ {formatTimecode(duration)}</span>
      </div>

      <select
        className="h-9 rounded-[var(--radius-md)] border border-border-subtle bg-background px-2 font-heading text-xs uppercase text-text-primary"
        value={editing.playbackSpeed}
        onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
        aria-label="Playback speed"
      >
        {speeds.map((speed) => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>

      <label className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-background px-2 text-text-secondary max-sm:hidden">
        <button type="button" onClick={() => setPreviewMuted(!editing.muted)} className="grid h-6 w-6 place-items-center rounded hover:bg-elevated" aria-label={editing.muted ? "Unmute preview" : "Mute preview"}>
          {editing.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          className="w-20 accent-cyan"
          type="range"
          min={0}
          max={100}
          value={editing.previewVolume}
          onChange={(event) => {
            setPreviewVolume(Number(event.target.value))
            setTimelineVolume(Number(event.target.value))
          }}
          aria-label="Preview volume"
        />
      </label>
    </section>
  )
}

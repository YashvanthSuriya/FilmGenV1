"use client"

import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import { TIMELINE_FPS, formatTimecode, parseTimecode } from "@/lib/editing/playback"

const speeds = [0.25, 0.5, 1, 1.5, 2]

export function TransportControls({ duration }: { duration: number }) {
  const editing = useProjectStore((state) => state.editingState)
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setPlaybackSpeed = useProjectStore((state) => state.setPlaybackSpeed)
  const setTimelineVolume = useProjectStore((state) => state.setTimelineVolume)
  const playing = editing.playbackState === "playing"

  function commitTimecode(value: string) {
    const seconds = parseTimecode(value)
    if (seconds !== null) setPlayheadPosition(Math.min(duration, seconds))
  }

  return (
    <section className="flex min-h-0 flex-wrap items-center justify-center gap-3 overflow-hidden border-b border-border-subtle bg-surface px-4 py-3 shadow-md">
      <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(0)} aria-label="Back to start">
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(Math.max(0, editing.playheadPosition - 1 / TIMELINE_FPS))} aria-label="Previous frame">
        <StepBack className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="primary" onClick={() => setPlaybackState(playing ? "paused" : "playing")} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(Math.min(duration, editing.playheadPosition + 1 / TIMELINE_FPS))} aria-label="Next frame">
        <StepForward className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => setPlayheadPosition(duration)} aria-label="End">
        <SkipForward className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Input
          className="h-9 w-28 font-body text-xs"
          value={formatTimecode(editing.playheadPosition)}
          onChange={(event) => commitTimecode(event.target.value)}
          aria-label="Current timecode"
        />
        <span className="font-body text-xs text-text-muted">/ {formatTimecode(duration)}</span>
      </div>

      <select
        className="h-9 rounded-[var(--radius-md)] border border-border bg-elevated px-2 font-heading text-xs uppercase text-text-primary"
        value={editing.playbackSpeed}
        onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
        aria-label="Playback speed"
      >
        {speeds.map((speed) => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>

      <label className="flex items-center gap-2 rounded-full border border-border-subtle bg-elevated px-3 py-1.5 text-text-secondary">
        <Volume2 className="h-4 w-4" />
        <input
          className="w-28 accent-cyan"
          type="range"
          min={0}
          max={100}
          value={editing.volume}
          onChange={(event) => setTimelineVolume(Number(event.target.value))}
          aria-label="Timeline volume"
        />
      </label>
    </section>
  )
}

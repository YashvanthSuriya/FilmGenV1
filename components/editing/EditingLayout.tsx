"use client"

import { useEffect } from "react"
import { InspectorPanel } from "@/components/editing/InspectorPanel"
import { MediaPanel } from "@/components/editing/MediaPanel"
import { PreviewPlayer } from "@/components/editing/PreviewPlayer"
import { Timeline } from "@/components/editing/Timeline"
import { TransportControls } from "@/components/editing/TransportControls"
import { useProjectStore } from "@/lib/stores/project"
import { getTimelineDuration } from "@/lib/editing/playback"

export function EditingLayout() {
  const clips = useProjectStore((state) => state.editingState.clips)
  const playbackState = useProjectStore((state) => state.editingState.playbackState)
  const playheadPosition = useProjectStore((state) => state.editingState.playheadPosition)
  const playbackSpeed = useProjectStore((state) => state.editingState.playbackSpeed)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const selectedClipId = useProjectStore((state) => state.editingState.selectedClipId)
  const deleteClip = useProjectStore((state) => state.deleteTimelineClip)
  const duration = getTimelineDuration(clips)

  useEffect(() => {
    if (playbackState !== "playing") return undefined
    if (duration <= 0) {
      setPlaybackState("paused")
      setPlayheadPosition(0)
      return undefined
    }
    const interval = window.setInterval(() => {
      const nextPosition = playheadPosition + 0.1 * playbackSpeed
      if (nextPosition >= duration) {
        setPlayheadPosition(duration)
        setPlaybackState("paused")
        return
      }
      setPlayheadPosition(nextPosition)
    }, 100)
    return () => window.clearInterval(interval)
  }, [duration, playbackSpeed, playbackState, playheadPosition, setPlaybackState, setPlayheadPosition])

  useEffect(() => {
    function handleDelete(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      if (!selectedClipId) return
      event.preventDefault()
      deleteClip(selectedClipId)
    }
    window.addEventListener("keydown", handleDelete)
    return () => window.removeEventListener("keydown", handleDelete)
  }, [deleteClip, selectedClipId])

  return (
    <main className="grid h-[calc(100vh-var(--nav-height))] grid-rows-[minmax(0,1fr)_auto_minmax(240px,30vh)] overflow-hidden bg-background">
      <section className="grid min-h-0 min-w-0 grid-cols-1 border-b border-border-subtle lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(420px,1fr)_auto] bg-background">
          <PreviewPlayer duration={duration} />
          <MediaPanel />
        </div>
        <InspectorPanel />
      </section>
      <TransportControls duration={duration} />
      <Timeline duration={duration} />
    </main>
  )
}

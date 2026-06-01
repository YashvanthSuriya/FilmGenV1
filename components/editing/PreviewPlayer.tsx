"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Maximize2, Minimize2, MonitorPlay, Pause, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"
import { formatTimecode, shouldRestartPlayback } from "@/lib/editing/playback"
import { computeGradeOverlay, computePreviewFilter } from "@/lib/editing/colorGrade"

export function PreviewPlayer({ duration }: { duration: number }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const playheadPosition = useProjectStore((state) => state.editingState.playheadPosition)
  const clips = useProjectStore((state) => state.editingState.clips)
  const assets = useProjectStore((state) => state.assets)
  const selectedClipId = useProjectStore((state) => state.editingState.selectedClipId)
  const playing = useProjectStore((state) => state.editingState.playbackState === "playing")
  const colorGrading = useProjectStore((state) => state.editingState.colorGrading)
  const textOverlay = useProjectStore((state) => state.editingState.textOverlays.clips.find((clip) => clip.clipId === state.editingState.selectedClipId))
  const setPlaybackState = useProjectStore((state) => state.setPlaybackState)
  const setPlayheadPosition = useProjectStore((state) => state.setPlayheadPosition)

  const activeClip = useMemo(() => {
    const atPlayhead = clips
      .filter((clip) => (clip.type === "video" || clip.type === "image") && playheadPosition >= clip.start && playheadPosition < clip.start + clip.duration)
      .sort((a, b) => b.start - a.start)[0]
    if (atPlayhead) return atPlayhead
    if (playing) return undefined
    return clips.find((clip) => clip.id === selectedClipId && (clip.type === "video" || clip.type === "image"))
  }, [clips, playheadPosition, playing, selectedClipId])

  const mediaFilter = colorGrading.previewMode === "before" ? "none" : computePreviewFilter(colorGrading)
  const gradeOverlay = computeGradeOverlay(colorGrading)
  const localTime = activeClip ? Math.min(activeClip.outPoint, Math.max(activeClip.inPoint, (playheadPosition - activeClip.start) * activeClip.speed + activeClip.inPoint)) : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeClip || activeClip.type !== "video") return
    if (Math.abs(video.currentTime - localTime) > 0.35) video.currentTime = localTime
    video.playbackRate = activeClip.speed
    if (playing && activeClip.type === "video") {
      void video.play().catch(() => undefined)
    } else {
      video.pause()
    }
  }, [activeClip, localTime, playing])

  const resolvedUrl = activeClip?.url ?? assets.find((item) => item.id === activeClip?.assetId)?.url

  function seek(event: React.PointerEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    setPlayheadPosition(ratio * duration)
  }

  function togglePlayback() {
    if (playing) {
      setPlaybackState("paused")
      return
    }
    if (shouldRestartPlayback(playheadPosition, duration)) setPlayheadPosition(0)
    setPlaybackState("playing")
  }

  async function openFullscreen() {
    setFullscreen(true)
    try {
      await previewRef.current?.requestFullscreen?.()
    } catch {
      // The in-app overlay is the primary fullscreen behavior.
    }
  }

  async function closeFullscreen() {
    setFullscreen(false)
    if (document.fullscreenElement) await document.exitFullscreen()
  }

  const previewSurface = (
    <div
      ref={previewRef}
      className="relative aspect-video max-h-full w-full max-w-full overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-black shadow-lg"
      onPointerDown={seek}
      onPointerMove={(event) => {
        if (event.buttons === 1) seek(event)
      }}
    >
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1),transparent_34%),#020202]">
        {resolvedUrl && activeClip?.type === "video" ? (
          <video ref={videoRef} key={resolvedUrl} className="h-full w-full" src={resolvedUrl} muted playsInline style={{ objectFit: activeClip.fit, filter: mediaFilter, opacity: activeClip.opacity / 100, transform: `translate(${activeClip.position.x}px, ${activeClip.position.y}px) scale(${activeClip.scale / 100}) rotate(${activeClip.rotation}deg) scaleX(${activeClip.flipX ? -1 : 1}) scaleY(${activeClip.flipY ? -1 : 1})` }} onPointerDown={(event) => event.stopPropagation()} />
        ) : resolvedUrl && activeClip?.type === "image" && resolvedUrl.startsWith("linear-gradient") ? (
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: resolvedUrl, filter: mediaFilter, opacity: activeClip.opacity / 100, transform: `translate(${activeClip.position.x}px, ${activeClip.position.y}px) scale(${activeClip.scale / 100}) rotate(${activeClip.rotation}deg) scaleX(${activeClip.flipX ? -1 : 1}) scaleY(${activeClip.flipY ? -1 : 1})` }} />
        ) : resolvedUrl && activeClip?.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="h-full w-full" src={resolvedUrl} alt={activeClip.name} style={{ objectFit: activeClip.fit, filter: mediaFilter, opacity: activeClip.opacity / 100, transform: `translate(${activeClip.position.x}px, ${activeClip.position.y}px) scale(${activeClip.scale / 100}) rotate(${activeClip.rotation}deg) scaleX(${activeClip.flipX ? -1 : 1}) scaleY(${activeClip.flipY ? -1 : 1})` }} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-text-muted">
            <MonitorPlay className="h-12 w-12 text-border-strong" />
            <span className="font-heading text-xs uppercase tracking-[0.08em]">Select or scrub over media</span>
          </div>
        )}
        {activeClip ? (
          <div className="absolute left-3 top-3 max-w-[55%] truncate rounded bg-black/70 px-2 py-1 font-heading text-[10px] uppercase tracking-[0.08em] text-text-secondary">
            {activeClip.name}
          </div>
        ) : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={gradeOverlay}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent ${72 - colorGrading.manual.vignette * 0.35}%, rgba(0,0,0,${colorGrading.manual.vignette / 120}) 100%)`
        }}
      />
      {colorGrading.manual.filmGrain > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "repeating-radial-gradient(circle at 12% 18%, rgba(255,255,255,0.22) 0 1px, transparent 1px 4px)",
            opacity: colorGrading.manual.filmGrain / 160
          }}
        />
      ) : null}
      {textOverlay ? (
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[18%] text-center" style={{ color: textOverlay.color, opacity: textOverlay.opacity / 100, fontFamily: textOverlay.fontFamily === "DM Sans" ? "var(--font-dm-sans)" : "var(--font-syne)", fontSize: `${Math.min(72, textOverlay.size)}px`, textAlign: textOverlay.alignment }}>
          {textOverlay.text}
        </div>
      ) : null}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/80 to-transparent p-3 opacity-100 transition" onPointerDown={(event) => event.stopPropagation()}>
        <span className="rounded bg-accent-cyan-dim px-2 py-1 font-heading text-xs uppercase tracking-[0.08em] text-accent-cyan">1920 x 1080</span>
        <div className="text-right">
          <span className="rounded bg-black/70 px-2 py-1 font-heading text-[10px] uppercase tracking-[0.08em] text-text-secondary">
            {colorGrading.previewMode === "before" ? "Before" : `${colorGrading.lut.name} ${colorGrading.lut.intensity}%`}
          </span>
          <p className="mt-2 font-body text-xs text-text-secondary">{formatTimecode(localTime)}</p>
        </div>
        <Button size="icon" variant="ghost" aria-label={fullscreen ? "Exit fullscreen preview" : "Fullscreen preview"} onClick={fullscreen ? () => void closeFullscreen() : () => void openFullscreen()}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-100 transition" onPointerDown={(event) => event.stopPropagation()}>
        <div className="h-1 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-accent-cyan" style={{ width: `${duration > 0 ? Math.min(100, (playheadPosition / duration) * 100) : 0}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between font-body text-xs text-text-secondary">
          <span>{formatTimecode(playheadPosition)}</span>
          <Button size="sm" variant="ghost" onClick={togglePlayback} disabled={duration <= 0}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="group grid min-h-0 min-w-0 place-items-center overflow-hidden bg-black p-4">
      {previewSurface}
      {fullscreen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/95 p-4">
          <Button size="icon" variant="ghost" className="absolute right-4 top-4" onClick={() => void closeFullscreen()} aria-label="Close fullscreen preview">
            <X className="h-5 w-5" />
          </Button>
          <div className="w-full max-w-6xl">{previewSurface}</div>
        </div>
      ) : null}
    </div>
  )
}

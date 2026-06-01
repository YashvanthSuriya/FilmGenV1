"use client"

import { Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"

export function AIMusicGenerator() {
  const tracks = useProjectStore((state) => state.editingState.audioState.musicTracks)
  const track = tracks[0]

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Music Direction</p>
      <div className="rounded border border-border-subtle bg-background p-3">
        <div className="mb-3 flex items-center gap-2">
          <Music2 className="h-4 w-4 text-accent-amber" />
          <p className="truncate text-sm text-text-primary">{track?.prompt ?? "Slow cinematic pulse with analog strings"}</p>
        </div>
        <div className="h-10 rounded bg-[repeating-linear-gradient(90deg,rgba(255,184,0,0.35)_0_2px,transparent_2px_8px)]" />
        <p className="mt-2 truncate text-xs text-text-muted">
          {track ? `${track.genre} / ${track.intensity} / ${track.duration}s` : "Static demo bed / Moderate / 32s"}
        </p>
      </div>
      <Button className="mt-3 w-full" variant="secondary" disabled title="Music generation is intentionally absent from the frontend-only demo.">
        Static Demo Track
      </Button>
    </section>
  )
}

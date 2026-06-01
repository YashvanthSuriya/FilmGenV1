"use client"

import { Film, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/stores/project"

export function ExportDemoPanel({ duration }: { duration: number }) {
  const clips = useProjectStore((state) => state.editingState.clips)
  const visualCount = clips.filter((clip) => clip.type === "image" || clip.type === "video").length

  return (
    <section className="border-b border-border-subtle bg-surface px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Review Output</h2>
          <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
            Frontend demo preview with {visualCount} visual clips across {Math.max(0, duration).toFixed(1)} seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-accent-cyan-dim text-accent-cyan">Static Demo</Badge>
          <Button size="sm" variant="secondary" disabled title="Export is intentionally absent from the frontend-only demo.">
            <Info className="h-4 w-4" />
            Export Disabled
          </Button>
          <Button size="sm" variant="ghost" disabled>
            <Film className="h-4 w-4" />
            Render Not Connected
          </Button>
        </div>
      </div>
    </section>
  )
}

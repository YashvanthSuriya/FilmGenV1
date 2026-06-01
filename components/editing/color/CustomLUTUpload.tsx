"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CustomLUTUpload() {
  return (
    <section className="rounded-[var(--radius-md)] border border-dashed border-border-subtle bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Custom LUT</p>
          <p className="mt-1 text-xs text-text-muted">Preset controls are shown with static demo color data.</p>
        </div>
        <Button size="sm" variant="ghost" disabled>
          <Info className="h-4 w-4" />
          Demo
        </Button>
      </div>
    </section>
  )
}

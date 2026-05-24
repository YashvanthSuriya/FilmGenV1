"use client"

import { Lock, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function CustomLUTUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState("")

  return (
    <section className="rounded-[var(--radius-md)] border border-dashed border-border-subtle bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Custom LUT</p>
          <p className="mt-1 text-xs text-text-muted">{fileName || "Upload .cube files with Filmmaker+."}</p>
        </div>
        <input ref={inputRef} hidden type="file" accept=".cube" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
        <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          .cube
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded border border-accent-amber bg-accent-amber-dim px-3 py-2 text-xs text-accent-amber">
        <Lock className="h-4 w-4" />
        Filmmaker+ plan lock placeholder
      </div>
    </section>
  )
}

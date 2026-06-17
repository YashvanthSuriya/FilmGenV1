"use client"

import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { useState } from "react"

export function CompiledPromptPreview({ prompt }: { prompt: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!prompt.trim()) {
    // Reserve space even when empty so the node height doesn't jump when a prompt
    // gets added/removed during graph edits (e.g. connecting/disconnecting a Style node).
    return (
      <div className="min-h-[58px] rounded-[var(--radius-sm)] border border-dashed border-border-subtle bg-background p-2">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-text-muted">
          <FileText className="h-3 w-3" />
          Compiled prompt
        </p>
        <p className="mt-1.5 text-[10px] text-text-muted/60">Connect creative inputs to assemble a prompt.</p>
      </div>
    )
  }

  const preview = prompt.length > 140 ? `${prompt.slice(0, 140)}…` : prompt

  return (
    <div className="min-h-[58px] rounded-[var(--radius-sm)] border border-border-subtle bg-background p-2">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setExpanded((open) => !open)
        }}
        className="flex w-full items-center justify-between gap-1.5 text-left text-[10px] uppercase tracking-[0.08em] text-text-muted"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Compiled prompt
        </span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      <p className={`mt-1.5 whitespace-pre-wrap text-[11px] leading-4 text-text-secondary ${expanded ? "" : "line-clamp-3"}`}>
        {expanded ? prompt : preview}
      </p>
    </div>
  )
}

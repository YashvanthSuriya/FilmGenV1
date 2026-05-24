"use client"

import { transitionDefinitions } from "@/lib/editing/transitions"
import type { TimelineTransition } from "@/lib/types"

export function TransitionOverlay({ transition, left }: { transition: TimelineTransition; left: number }) {
  const definition = transitionDefinitions[transition.type]
  const previewClass =
    transition.type === "wipe"
      ? "bg-[linear-gradient(90deg,var(--accent-purple)_0_48%,transparent_49%_100%)]"
      : transition.type === "dipToBlack"
        ? "bg-[radial-gradient(circle,transparent_0_35%,#000_60%)]"
        : transition.type === "fadeInOut"
          ? "bg-[linear-gradient(90deg,#000_0%,var(--accent-purple)_50%,#000_100%)]"
          : transition.type === "cut"
            ? "bg-[linear-gradient(90deg,transparent_0_46%,var(--accent-red)_47%_53%,transparent_54%)]"
            : "bg-[linear-gradient(135deg,transparent_0_38%,var(--accent-purple)_45%_55%,transparent_62%)]"

  return (
    <button
      type="button"
      title={definition.label}
      className="absolute top-2 z-20 h-9 w-11 -translate-x-1/2 overflow-hidden rounded-sm border border-accent-purple bg-accent-purple/20"
      style={{ left }}
      aria-label={definition.label}
    >
      <span className={`block h-full w-full ${previewClass}`} />
      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] uppercase text-text-primary">{definition.label.slice(0, 4)}</span>
    </button>
  )
}

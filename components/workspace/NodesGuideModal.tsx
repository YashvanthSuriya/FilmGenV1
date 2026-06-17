"use client"

import { X } from "lucide-react"
import { nodeGuides } from "@/lib/workspace/nodeGuides"

export function NodesGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.2rem] border border-border-subtle bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Director Workspace</p>
            <h2 className="font-heading text-lg font-bold text-text-primary">Node guide — what each node does</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-text-muted hover:border-accent-red hover:text-accent-red"
            aria-label="Close guide"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <p className="mb-4 text-xs text-text-secondary">
            The Director Workspace is a node graph. You connect creative inputs (Style, Character, Action, Script, Prompt, Camera) into generation targets (Image Output, Video Output) which feed a Preview node that sequences and sends to Editing. Every node contributes something specific to the compiled prompt that gets sent to the model.
          </p>

          <div className="grid gap-3">
            {nodeGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <div key={guide.type} className="rounded-[var(--radius-md)] border border-border-subtle bg-background p-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-accent-cyan-dim text-accent-cyan">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-heading text-sm font-bold text-text-primary">{guide.label}</h3>
                        <span className="text-[10px] uppercase tracking-[0.06em] text-text-muted">node</span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{guide.description}</p>

                      <div className="mt-2 grid gap-1.5 text-[11px]">
                        <div>
                          <span className="font-semibold text-accent-cyan">Contributes to prompt: </span>
                          <span className="text-text-secondary">{guide.contributes}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-accent-amber">When to use: </span>
                          <span className="text-text-secondary">{guide.whenToUse}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-accent-green">Example: </span>
                          <span className="text-text-secondary">{guide.example}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] border border-accent-cyan/30 bg-accent-cyan-dim p-3 text-xs text-accent-cyan">
            <p className="font-semibold">Tip: Hover the ? icon on any node in the workspace to see a quick summary of what it does.</p>
          </div>
        </div>

        <footer className="border-t border-border-subtle px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] bg-accent-cyan px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black transition hover:brightness-110"
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  )
}

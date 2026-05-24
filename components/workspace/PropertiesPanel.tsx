"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspaceStore } from "@/lib/stores/workspace"

export function PropertiesPanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const inspectedNodeId = useWorkspaceStore((state) => state.inspectedNode)
  const selectedNode = useWorkspaceStore((state) => state.nodes.find((node) => node.id === state.inspectedNode))
  const inspectNode = useWorkspaceStore((state) => state.inspectNode)
  const updateNode = useWorkspaceStore((state) => state.updateNode)

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!inspectedNodeId) return
      const target = event.target as HTMLElement
      if (panelRef.current?.contains(target) || target.closest("[data-node-info-button='true']")) return
      inspectNode(null)
    }

    window.addEventListener("mousedown", closeOnOutside)
    return () => window.removeEventListener("mousedown", closeOnOutside)
  }, [inspectNode, inspectedNodeId])

  return (
    <aside
      ref={panelRef}
      className={`absolute right-0 top-0 z-30 h-full w-[320px] border-l border-border-subtle bg-surface shadow-lg transition-transform duration-200 max-md:top-auto max-md:bottom-0 max-md:h-[44vh] max-md:w-full max-md:border-l-0 max-md:border-t ${
        selectedNode ? "translate-x-0 max-md:translate-y-0" : "translate-x-full max-md:translate-x-0 max-md:translate-y-full"
      }`}
    >
      {selectedNode ? (
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
            <div>
              <p className="font-heading text-xs font-semibold uppercase text-text-muted">Properties</p>
              <h2 className="font-heading text-lg font-bold text-text-primary">{selectedNode.data.label ?? selectedNode.type}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => inspectNode(null)} aria-label="Close properties">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input id="node-label" value={selectedNode.data.label ?? ""} onChange={(event) => updateNode(selectedNode.id, { label: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-sm text-text-secondary">
                {selectedNode.data.status ?? "idle"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Node Type</Label>
              <div className="rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-sm text-text-secondary">
                {selectedNode.type}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Output</Label>
              <textarea
                value={selectedNode.data.output ?? ""}
                onChange={(event) => updateNode(selectedNode.id, { output: event.target.value })}
                placeholder="Local output placeholder"
                className="min-h-28 w-full resize-none rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

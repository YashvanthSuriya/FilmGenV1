"use client"

import { ChevronDown, ChevronUp, HelpCircle, type LucideIcon } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { cn } from "@/lib/utils"
import type { WorkspaceNodeType, WorkspaceRunStatus } from "@/lib/types"
import { nodeGuideForType } from "@/lib/workspace/nodeGuides"

const statusLabels: Record<WorkspaceRunStatus, string> = {
  idle: "Idle",
  queued: "Queued",
  generating: "Generating",
  completed: "Completed",
  error: "Error"
}

export function BaseNode({
  id,
  icon: Icon,
  label,
  selected,
  status = "idle",
  children,
  footer,
  className,
  bodyClassName,
  nodeType
}: {
  id?: string
  icon: LucideIcon
  label: string
  selected?: boolean
  status?: WorkspaceRunStatus
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  bodyClassName?: string
  nodeType?: WorkspaceNodeType
}) {
  const guide = nodeType ? nodeGuideForType(nodeType) : undefined
  const collapsed = useWorkspaceStore((state) => (id ? state.collapsedNodeIds.has(id) : false))
  const toggleNodeCollapsed = useWorkspaceStore((state) => state.toggleNodeCollapsed)

  return (
    <div
      className={cn(
        "w-[248px] overflow-hidden rounded-(--radius-md) border bg-node-bg text-text-primary shadow-md",
        selected ? "border-node-selected shadow-cyan" : "border-node-border",
        collapsed && "min-h-0",
        !collapsed && "min-h-[150px]",
        className
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-node-bg bg-(--node-handle)!" />
      <div className="flex h-8 items-center justify-between border-b border-border-subtle bg-elevated px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-accent-cyan" />
          <span className="truncate font-heading text-[10px] font-semibold uppercase text-text-secondary">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {guide ? (
            <NodeHelpButton guide={guide} />
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (id) toggleNodeCollapsed(id)
            }}
            className="grid h-5 w-5 place-items-center rounded text-text-muted transition hover:bg-background hover:text-accent-cyan"
            aria-label={collapsed ? "Expand node" : "Collapse node"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
        </div>
      </div>
      {!collapsed ? (
        <>
          <div className={cn("space-y-3 p-3 text-sm text-text-secondary", bodyClassName)}>{children}</div>
          <div className="flex min-h-8 items-center justify-between border-t border-border-subtle px-3 py-2 text-[11px] text-text-muted">
            <span>{statusLabels[status]}</span>
            {footer}
          </div>
        </>
      ) : (
        <div className="flex h-7 items-center justify-between px-3 text-[10px] text-text-muted">
          <span>{statusLabels[status]}</span>
          {footer}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-node-bg bg-(--node-handle-active)!" />
    </div>
  )
}

/**
 * Help (?) button that opens a tooltip popover. The popover is rendered via a React Portal
 * to document.body so it escapes the node's `overflow-hidden` container and is never clipped.
 * Position is computed from the button's bounding rect on open, so it stays anchored correctly.
 */
function NodeHelpButton({ guide }: { guide: NonNullable<ReturnType<typeof nodeGuideForType>> }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Recompute position every time the popover opens (in case the node moved).
  useLayoutEffect(() => {
    if (!open) return
    function update() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      // Place the popover below and aligned to the right edge of the button.
      // Clamp to viewport so it never goes off-screen.
      const POPOVER_WIDTH = 280
      const GAP = 6
      const left = Math.min(rect.right - POPOVER_WIDTH, window.innerWidth - POPOVER_WIDTH - 8)
      const top = rect.bottom + GAP
      setCoords({ top, left: Math.max(8, left) })
    }
    update()
    // Recompute on scroll / resize too (the node can move when the canvas pans).
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [open])

  const GuideIcon = guide.icon

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((o) => !o)
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="grid h-5 w-5 place-items-center rounded text-text-muted transition hover:bg-background hover:text-accent-cyan"
        aria-label={`What does ${guide.label} do?`}
        title="What does this node do?"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && coords
        ? createPortal(
            <div
              // Fixed positioning escapes any transformed/overflow-hidden ancestors.
              style={{ position: "fixed", top: coords.top, left: coords.left, width: 280, zIndex: 9999 }}
              className="rounded-(--radius-md) border border-border bg-overlay p-3 text-left shadow-xl"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <div className="flex items-center gap-1.5">
                <GuideIcon className="h-3.5 w-3.5 text-accent-cyan" />
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.08em] text-accent-cyan">{guide.label}</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-text-secondary">{guide.short}</p>
              <p className="mt-2 text-[10px] leading-4 text-text-muted">
                <span className="font-semibold text-text-secondary">Contributes: </span>
                {guide.contributes}
              </p>
              <p className="mt-1.5 text-[10px] leading-4 text-text-muted">
                <span className="font-semibold text-text-secondary">When to use: </span>
                {guide.whenToUse}
              </p>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

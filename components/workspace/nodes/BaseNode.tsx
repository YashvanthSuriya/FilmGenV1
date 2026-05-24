"use client"

import { Info, type LucideIcon } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { cn } from "@/lib/utils"
import type { WorkspaceRunStatus } from "@/lib/types"

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
  bodyClassName
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
}) {
  const inspectNode = useWorkspaceStore((state) => state.inspectNode)

  return (
    <div
      className={cn(
        "min-h-[150px] w-[248px] overflow-hidden rounded-[var(--radius-md)] border bg-node-bg text-text-primary shadow-md",
        selected ? "border-node-selected shadow-cyan" : "border-node-border",
        className
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-node-bg !bg-[var(--node-handle)]" />
      <div className="flex h-8 items-center justify-between border-b border-border-subtle bg-elevated px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-accent-cyan" />
          <span className="truncate font-heading text-[10px] font-semibold uppercase text-text-secondary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {id ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                inspectNode(id)
              }}
              className="grid h-5 w-5 place-items-center rounded text-text-muted transition hover:bg-background hover:text-accent-cyan"
              aria-label={`Open ${label} properties`}
              data-node-info-button="true"
              title="Properties"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
        </div>
      </div>
      <div className={cn("space-y-3 p-3 text-sm text-text-secondary", bodyClassName)}>{children}</div>
      <div className="flex min-h-8 items-center justify-between border-t border-border-subtle px-3 py-2 text-[11px] text-text-muted">
        <span>{statusLabels[status]}</span>
        {footer}
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-node-bg !bg-[var(--node-handle-active)]" />
    </div>
  )
}

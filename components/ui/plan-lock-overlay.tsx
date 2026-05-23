import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PlanTier } from "@/lib/types"

interface PlanLockOverlayProps {
  requiredPlan?: Exclude<PlanTier, "free">
  title?: string
  description?: string
  className?: string
}

export function PlanLockOverlay({
  requiredPlan = "creator",
  title = "Locked on free tier",
  description = "This feature is reserved for a later paid-plan release.",
  className
}: PlanLockOverlayProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border-subtle bg-elevated/70 p-4 text-sm text-text-secondary",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">
          <Lock className="h-4 w-4 text-accent-amber" />
          {title}
        </div>
        <Badge className="bg-accent-amber-dim text-accent-amber">{requiredPlan}</Badge>
      </div>
      <p>{description}</p>
    </div>
  )
}

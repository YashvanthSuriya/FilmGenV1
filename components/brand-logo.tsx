import { cn } from "@/lib/utils"

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="h-3 w-3 rounded-[3px] bg-accent-cyan shadow-[0_0_18px_rgba(0,229,255,0.6)]" />
      <span className={cn("font-heading font-extrabold tracking-[0.08em] text-text-primary", compact ? "text-lg" : "text-[22px]")}>
        FILMGEN
      </span>
    </div>
  )
}

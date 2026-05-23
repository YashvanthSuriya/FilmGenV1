import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent-cyan-dim px-2 py-0.5 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan",
        className
      )}
      {...props}
    />
  )
}

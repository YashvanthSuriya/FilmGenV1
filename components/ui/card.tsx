import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }

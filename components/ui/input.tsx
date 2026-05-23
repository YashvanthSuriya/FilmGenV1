import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-base text-text-primary placeholder:text-text-muted outline-none transition focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan-dim disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }

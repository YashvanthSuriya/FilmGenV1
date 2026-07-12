"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ElitePlanCardProps {
  className?: string
  imageUrl: string
  title: string
  subtitle: string
  description: string
  fallbackBackground?: string
  highlights?: string[]
  actionLabel?: string
  active?: boolean
  onAction?: () => void
}

export const ElitePlanCard = React.forwardRef<HTMLDivElement, ElitePlanCardProps>(
  (
    {
      className,
      imageUrl,
      title,
      subtitle,
      description,
      fallbackBackground = "linear-gradient(135deg, rgba(0,229,255,0.28), rgba(9,11,18,0.96) 48%, rgba(255,184,0,0.18))",
      highlights = [],
      actionLabel = "Open",
      active,
      onAction
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.015, y: -3 }}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
        className={cn(
          "relative w-full overflow-hidden rounded-[1.5rem] border bg-black/70 shadow-2xl shadow-black/30 backdrop-blur-xl",
          active ? "border-accent-cyan shadow-cyan" : "border-white/[0.12]",
          className
        )}
      >
        <motion.div className="relative h-52 w-full overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.45 }} style={{ background: fallbackBackground }}>
          <img src={imageUrl} alt={title} className="h-full w-full object-cover opacity-90" onError={(event) => { event.currentTarget.style.display = "none" }} />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-white/10" />
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/[0.12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/82 backdrop-blur-md">
            {subtitle}
          </div>
        </motion.div>

        <div className="relative z-10 bg-black/80 p-5 text-white">
          <h3 className="font-heading text-2xl font-bold leading-tight">{title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/68">{description}</p>

          {highlights.length > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/58">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-(--radius-md) border border-white/10 bg-white/[0.08] px-2 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {onAction ? (
            <Button variant="primary" className="mt-5 w-full" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </motion.div>
    )
  }
)

ElitePlanCard.displayName = "ElitePlanCard"

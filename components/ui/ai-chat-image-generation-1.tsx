"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

export interface ImageGenerationProps {
  children: React.ReactNode
  isGenerating: boolean
  label?: string
  className?: string
}

/**
 * Image generation loading card with shimmer text + blurred reveal overlay.
 *
 * When `isGenerating` is true: shows a shimmering "Creating image..." label and
 * a blurred overlay that animates from bottom to top (clip-path progress).
 * When `isGenerating` becomes false: overlay fades out, revealing the image.
 *
 * Adapted from 21st.dev's ai-chat-image-generation-1 component to use
 * the project's CSS variables and a controlled `isGenerating` prop.
 */
export const ImageGeneration = React.forwardRef<HTMLDivElement, ImageGenerationProps>(
  ({ children, isGenerating, label, className }, ref) => {
    const [progress, setProgress] = React.useState(0)
    const [showOverlay, setShowOverlay] = React.useState(isGenerating)
    const duration = 8000 // 8s mock duration — covers the ~500ms mock + feels real

    React.useEffect(() => {
      if (!isGenerating) {
        // Generation done — animate overlay out
        setProgress(100)
        const timeout = setTimeout(() => setShowOverlay(false), 600)
        return () => clearTimeout(timeout)
      }

      // Generation started — reset and animate progress
      setShowOverlay(true)
      setProgress(0)
      const startTime = Date.now()

      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const progressPercentage = Math.min(95, (elapsedTime / duration) * 100)
        setProgress(progressPercentage)
      }, 16)

      return () => clearInterval(interval)
    }, [isGenerating, duration])

    const loadingState = isGenerating
      ? progress < 5
        ? "starting"
        : "generating"
      : "completed"

    return (
      <div className={cn("flex flex-col gap-1.5", className)} ref={ref}>
        <motion.span
          className="bg-[linear-gradient(110deg,var(--text-muted),35%,var(--text-primary),50%,var(--text-muted),75%,var(--text-muted))] bg-[length:200%_100%] bg-clip-text text-transparent text-sm font-medium"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              loadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: loadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {loadingState === "starting" && `Getting started.${label ? ` ${label}` : ""}`}
          {loadingState === "generating" && `Creating image. May take a moment.${label ? ` ${label}` : ""}`}
          {loadingState === "completed" && `Image created.${label ? ` ${label}` : ""}`}
        </motion.span>
        <div className="relative rounded-[var(--radius-md)] border border-border bg-elevated overflow-hidden">
          {children}
          {showOverlay ? (
            <motion.div
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={false}
              animate={{
                clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                opacity: isGenerating ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                backgroundColor: "rgba(10, 10, 12, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                maskImage:
                  progress === 0
                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                    : `linear-gradient(to bottom, transparent ${Math.max(0, progress - 5)}%, transparent ${progress}%, black ${Math.min(100, progress + 5)}%)`,
                WebkitMaskImage:
                  progress === 0
                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                    : `linear-gradient(to bottom, transparent ${Math.max(0, progress - 5)}%, transparent ${progress}%, black ${Math.min(100, progress + 5)}%)`,
              }}
            />
          ) : null}
        </div>
      </div>
    )
  }
)

ImageGeneration.displayName = "ImageGeneration"

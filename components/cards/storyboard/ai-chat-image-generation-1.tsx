"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ImageGenerationProps {
  children: React.ReactNode;
  progress?: number;
  loadingState?: "starting" | "generating" | "completed";
  labels?: Partial<Record<"starting" | "generating" | "completed", string>>;
}

export const ImageGeneration: React.FC<ImageGenerationProps> = (
  ({ children, progress, loadingState, labels} : ImageGenerationProps) => {
    const [internalProgress, setInternalProgress] = React.useState(0);
    const [internalLoadingState, setInternalLoadingState] = React.useState<
      "starting" | "generating" | "completed"
    >("starting");
    const duration = 30000;
    const isControlled = typeof progress === "number" || typeof loadingState !== "undefined";
    const resolvedProgress = Math.min(100, Math.max(0, progress ?? internalProgress));
    const resolvedLoadingState =
      loadingState ??
      (isControlled
        ? resolvedProgress >= 100
          ? "completed"
          : resolvedProgress > 0
            ? "generating"
            : "starting"
        : internalLoadingState);

    React.useEffect(() => {
      if (isControlled) return undefined;
      const startingTimeout = setTimeout(() => {
        setInternalLoadingState("generating");

        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const progressPercentage = Math.min(
            100,
            (elapsedTime / duration) * 100
          );

          setInternalProgress(progressPercentage);

          if (progressPercentage >= 100) {
            clearInterval(interval);
            setInternalLoadingState("completed");
          }
        }, 16);

        return () => clearInterval(interval);
      }, 3000);

      return () => clearTimeout(startingTimeout);
    }, [duration, isControlled]);

    return (
      <div className={cn("flex flex-col gap-2")}>
        <motion.span
          className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-size-[200%_100%] bg-clip-text text-transparent text-sm font-medium"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              resolvedLoadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: resolvedLoadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {resolvedLoadingState === "starting" && (labels?.starting ?? "Getting started.")}
          {resolvedLoadingState === "generating" && (labels?.generating ?? "Creating image. May take a moment.")}
          {resolvedLoadingState === "completed" && (labels?.completed ?? "Image created.")}
        </motion.span>
        <div className={cn("relative max-w-[360px] overflow-hidden rounded-xl border bg-card")}>
            {children}
          <motion.div
            className="absolute w-full h-[125%] top-[-25%] pointer-events-none backdrop-blur-3xl"
            initial={false}
            animate={{
              clipPath: `polygon(0 ${resolvedProgress}%, 100% ${resolvedProgress}%, 100% 100%, 0 100%)`,
              opacity: resolvedLoadingState === "completed" ? 0 : 1,
            }}
            style={{
              clipPath: `polygon(0 ${resolvedProgress}%, 100% ${resolvedProgress}%, 100% 100%, 0 100%)`,
              maskImage:
                resolvedProgress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${resolvedProgress - 5}%, transparent ${resolvedProgress}%, black ${resolvedProgress + 5}%)`,
              WebkitMaskImage:
                resolvedProgress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${resolvedProgress - 5}%, transparent ${resolvedProgress}%, black ${resolvedProgress + 5}%)`,
            }}
          />
        </div>
      </div>
    );
  }
);

ImageGeneration.displayName = "ImageGeneration";

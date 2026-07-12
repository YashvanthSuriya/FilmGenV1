"use client"

import { Aperture, Camera, Focus, Move } from "lucide-react"
import { defaultCameraConfig } from "@/lib/stores/project"
import type { CameraConfig } from "@/lib/types"
import { cn } from "@/lib/utils"

const cameraBodyOptions = [
  { value: "modular-8k-digital", label: "Modular 8K", description: "Cinema camera", icon: Camera },
  { value: "full-frame-cine", label: "Full-frame Cine", description: "Clean studio body", icon: Camera },
  { value: "handheld-doc", label: "Handheld Doc", description: "Agile shoulder rig", icon: Camera },
  { value: "vintage-16mm", label: "Vintage 16mm", description: "Soft film body", icon: Camera }
]

const lensTypeOptions = [
  { value: "creative-tilt-lens", label: "Creative Tilt", description: "Stylized focus", icon: Focus },
  { value: "compact-anamorphic", label: "Compact Anamorphic", description: "Wide flare", icon: Focus },
  { value: "macro-prime", label: "Macro Prime", description: "Tight detail", icon: Focus },
  { value: "wide-rectilinear", label: "Wide Rectilinear", description: "Clean architecture", icon: Focus }
]

const focalLengthOptions = ["18", "24", "35", "50", "85", "135"]

const movementOptions = [
  { value: "locked-off", label: "Locked Off" },
  { value: "dolly", label: "Dolly" },
  { value: "tracking", label: "Tracking" },
  { value: "slow push-in", label: "Slow Push-In" },
  { value: "handheld", label: "Handheld" },
  { value: "subtle handheld", label: "Subtle Handheld" },
  { value: "crane", label: "Crane" },
  { value: "drone", label: "Drone" }
]

const angleOptions = [
  { value: "eye-level", label: "Eye-Level" },
  { value: "low-angle", label: "Low Angle" },
  { value: "high-angle", label: "High Angle" },
  { value: "overhead", label: "Overhead" },
  { value: "dutch", label: "Dutch" },
  { value: "ground", label: "Ground" }
]

const apertureOptions = [
  { value: "f/1.4", label: "F/1.4", description: "Creamy bokeh", icon: Aperture },
  { value: "f/2.8", label: "F/2.8", description: "Balanced depth", icon: Aperture },
  { value: "f/4", label: "F/4", description: "Controlled focus", icon: Aperture },
  { value: "f/8", label: "F/8", description: "Deep focus", icon: Aperture }
]

/** Normalize a legacy CameraConfig that may not yet have body/lens/focalLength. */
export function normalizeCamera(camera: CameraConfig | undefined): CameraConfig {
  if (!camera) return { ...defaultCameraConfig }
  const focalLength =
    camera.focalLength ??
    (camera.lens && camera.lens.endsWith("mm") ? camera.lens.replace(/mm$/, "") : defaultCameraConfig.focalLength)
  const lens =
    camera.lens && !camera.lens.endsWith("mm") ? camera.lens : defaultCameraConfig.lens
  const body = camera.body ?? defaultCameraConfig.body
  return {
    body,
    lens,
    focalLength,
    movement: camera.movement ?? defaultCameraConfig.movement,
    angle: camera.angle ?? defaultCameraConfig.angle,
    aperture: camera.aperture ?? defaultCameraConfig.aperture,
    fps: camera.fps ?? defaultCameraConfig.fps
  }
}

/**
 * Shared camera config grid — used by:
 *   - The Director Workspace CameraConfigNode (inside a BaseNode wrapper)
 *   - The Storyboard composer Camera accordion (inline, no wrapper)
 *
 * `compact` mode uses smaller text/padding for narrow containers like the storyboard
 * composer's floating tools menu.
 */
export function CameraConfigGrid({
  camera,
  onChange,
  compact = false
}: {
  camera: CameraConfig | undefined
  onChange: (next: CameraConfig) => void
  compact?: boolean
}) {
  const safeCamera = normalizeCamera(camera)
  function update(patch: Partial<CameraConfig>) {
    onChange({ ...safeCamera, ...patch })
  }

  const selectedCamera = cameraBodyOptions.find((option) => option.value === safeCamera.body) ?? cameraBodyOptions[1]
  const selectedLens = lensTypeOptions.find((option) => option.value === safeCamera.lens) ?? lensTypeOptions[1]
  const selectedAperture = apertureOptions.find((option) => option.value === safeCamera.aperture) ?? apertureOptions[1]

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-4" : "md:grid-cols-4")}>
        <OptionColumn title="Camera Body" compact={compact}>
          {cameraBodyOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={safeCamera.body === option.value}
              onClick={() => update({ body: option.value })}
              compact={compact}
            />
          ))}
        </OptionColumn>

        <OptionColumn title="Lens Type" compact={compact}>
          {lensTypeOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={safeCamera.lens === option.value}
              onClick={() => update({ lens: option.value })}
              compact={compact}
            />
          ))}
        </OptionColumn>

        <OptionColumn title="Focal Length" compact={compact}>
          {focalLengthOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update({ focalLength: option })}
              className={cn(
                "grid place-items-center rounded-(--radius-md) border bg-background text-center font-heading transition",
                compact ? "min-h-12" : "min-h-16",
                safeCamera.focalLength === option ? "border-accent-cyan text-accent-cyan shadow-cyan" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
              )}
            >
              <span className={compact ? "text-base font-bold" : "text-xl font-bold"}>{option}</span>
              <span className="text-[10px] uppercase tracking-[0.08em]">mm</span>
            </button>
          ))}
        </OptionColumn>

        <OptionColumn title="Aperture" compact={compact}>
          {apertureOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={safeCamera.aperture === option.value}
              onClick={() => update({ aperture: option.value })}
              compact={compact}
            />
          ))}
        </OptionColumn>
      </div>

      <div className="grid gap-3 border-t border-border-subtle pt-3 md:grid-cols-2">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
            <Move className="h-3 w-3" /> Movement
          </p>
          <div className="flex flex-wrap gap-1.5">
            {movementOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ movement: option.value })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  safeCamera.movement === option.value
                    ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
                    : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Angle</p>
          <div className="flex flex-wrap gap-1.5">
            {angleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ angle: option.value })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  safeCamera.angle === option.value
                    ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
                    : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2 border-t border-border-subtle pt-3 text-[11px] uppercase tracking-[0.08em] text-accent-cyan md:grid-cols-4">
        <span>{selectedCamera.label}</span>
        <span>{selectedLens.label}</span>
        <span>{safeCamera.focalLength}mm · {safeCamera.movement}</span>
        <span>{selectedAperture.description}</span>
      </div>
    </div>
  )
}

function OptionColumn({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <section>
      <h3 className={cn("mb-2 text-center font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted", compact && "text-[9px]")}>{title}</h3>
      <div className={cn("camera-option-scroll grid gap-2 overflow-y-auto rounded-(--radius-md) border border-border-subtle bg-black/30 p-2", compact ? "max-h-40" : "max-h-56")}>
        {children}
      </div>
    </section>
  )
}

function VisualOption({
  label,
  description,
  icon: Icon,
  active,
  onClick,
  compact
}: {
  label: string
  description: string
  icon: typeof Camera
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group grid place-items-center rounded-(--radius-md) border bg-background p-2 text-center transition",
        compact ? "min-h-16" : "min-h-24",
        active ? "border-accent-cyan text-text-primary shadow-cyan" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
      )}
    >
      <span className={cn("grid place-items-center rounded-(--radius-md) border", compact ? "h-9 w-12" : "h-12 w-16", active ? "border-accent-cyan bg-accent-cyan-dim" : "border-border bg-elevated")}>
        <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} />
      </span>
      <span className={cn("mt-2 font-heading font-bold uppercase tracking-[0.04em]", compact ? "text-[9px]" : "text-[10px]")}>{label}</span>
      <span className="text-[10px] text-text-muted">{description}</span>
    </button>
  )
}

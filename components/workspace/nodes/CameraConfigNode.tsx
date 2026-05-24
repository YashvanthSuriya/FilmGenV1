"use client"

import type { NodeProps } from "@xyflow/react"
import { Aperture, Camera, Focus, SlidersHorizontal } from "lucide-react"
import { defaultCameraConfig } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { CameraConfig, WorkspaceNode } from "@/lib/types"
import { cn } from "@/lib/utils"
import { BaseNode } from "./BaseNode"

const cameraOptions = [
  { value: "modular-8k-digital", label: "Modular 8K Digital", description: "Cinema camera", icon: Camera },
  { value: "full-frame-cine", label: "Full-frame Cine", description: "Clean studio body", icon: Camera },
  { value: "handheld-doc", label: "Handheld Doc", description: "Agile shoulder rig", icon: Camera },
  { value: "vintage-16mm", label: "Vintage 16mm", description: "Soft film body", icon: Camera }
]

const lensOptions = [
  { value: "creative-tilt-lens", label: "Creative Tilt Lens", description: "Stylized focus plane", icon: Focus },
  { value: "compact-anamorphic", label: "Compact Anamorphic", description: "Wide cinematic flare", icon: Focus },
  { value: "macro-prime", label: "Macro Prime", description: "Tight detail work", icon: Focus },
  { value: "wide-rectilinear", label: "Wide Rectilinear", description: "Clean architecture", icon: Focus }
]

const focalOptions = ["18", "24", "35", "50", "85", "135"]
const apertureOptions = [
  { value: "f/1.4", label: "F/1.4", description: "Creamy bokeh", icon: Aperture },
  { value: "f/2.8", label: "F/2.8", description: "Balanced depth", icon: Aperture },
  { value: "f/4", label: "F/4", description: "Controlled focus", icon: Aperture },
  { value: "f/8", label: "F/8", description: "Deep focus", icon: Aperture }
]

export function CameraConfigNode({ id, data, selected }: NodeProps<WorkspaceNode>) {
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const camera = data.camera ?? defaultCameraConfig

  function updateCamera(value: Partial<CameraConfig>) {
    updateNode(id, { camera: { ...camera, ...value } })
  }

  const selectedCamera = cameraOptions.find((option) => option.value === camera.movement) ?? cameraOptions[0]
  const selectedLens = lensOptions.find((option) => option.value === camera.lens) ?? lensOptions[0]
  const focalLength = camera.angle.replace("mm", "") || "35"
  const selectedAperture = apertureOptions.find((option) => option.value === camera.aperture) ?? apertureOptions[1]

  return (
    <BaseNode
      icon={SlidersHorizontal}
      id={id}
      label="Camera Config"
      selected={selected}
      status={data.status}
      className="max-h-[520px] w-[620px] max-w-[80vw]"
      bodyClassName="camera-option-scroll max-h-[440px] overflow-y-auto p-4"
      footer={<span>{selectedCamera.label}</span>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <OptionColumn title="Camera">
          {cameraOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={selectedCamera.value === option.value}
              onClick={() => updateCamera({ movement: option.value })}
            />
          ))}
        </OptionColumn>

        <OptionColumn title="Lens">
          {lensOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={selectedLens.value === option.value}
              onClick={() => updateCamera({ lens: option.value })}
            />
          ))}
        </OptionColumn>

        <OptionColumn title="Focal Length">
          {focalOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateCamera({ angle: `${option}mm` })}
              className={cn(
                "grid min-h-16 place-items-center rounded-[var(--radius-md)] border bg-background text-center font-heading transition",
                focalLength === option ? "border-accent-cyan text-accent-cyan shadow-cyan" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
              )}
            >
              <span className="text-xl font-bold">{option}</span>
              <span className="text-[10px] uppercase tracking-[0.08em]">mm</span>
            </button>
          ))}
        </OptionColumn>

        <OptionColumn title="Aperture">
          {apertureOptions.map((option) => (
            <VisualOption
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              active={selectedAperture.value === option.value}
              onClick={() => updateCamera({ aperture: option.value })}
            />
          ))}
        </OptionColumn>
      </div>
      <div className="grid gap-2 border-t border-border-subtle pt-3 text-[11px] uppercase tracking-[0.08em] text-accent-cyan md:grid-cols-4">
        <span>{selectedCamera.label}</span>
        <span>{selectedLens.label}</span>
        <span>{focalLength}mm cinematic perspective</span>
        <span>{selectedAperture.description}</span>
      </div>
    </BaseNode>
  )
}

function OptionColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-center font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{title}</h3>
      <div className="camera-option-scroll grid max-h-56 gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-border-subtle bg-black/30 p-2">
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
  onClick
}: {
  label: string
  description: string
  icon: typeof Camera
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group grid min-h-24 place-items-center rounded-[var(--radius-md)] border bg-background p-2 text-center transition",
        active ? "border-accent-cyan text-text-primary shadow-cyan" : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
      )}
    >
      <span className={cn("grid h-12 w-16 place-items-center rounded-[var(--radius-md)] border", active ? "border-accent-cyan bg-accent-cyan-dim" : "border-border bg-elevated")}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="mt-2 font-heading text-[10px] font-bold uppercase tracking-[0.04em]">{label}</span>
      <span className="text-[10px] text-text-muted">{description}</span>
    </button>
  )
}

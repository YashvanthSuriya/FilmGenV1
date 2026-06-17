/**
 * Shared camera option metadata used by both:
 * - The Director Workspace CameraConfigNode
 * - The Storyboard composer Camera accordion panel
 *
 * Keeping these in one place ensures both surfaces stay in sync as new
 * camera bodies, lenses, or movements are added.
 */

import { Aperture, Camera, Focus } from "lucide-react"

export const cameraBodyOptions = [
  { value: "modular-8k-digital", label: "Modular 8K", description: "Cinema camera" },
  { value: "full-frame-cine", label: "Full-frame Cine", description: "Clean studio body" },
  { value: "handheld-doc", label: "Handheld Doc", description: "Agile shoulder rig" },
  { value: "vintage-16mm", label: "Vintage 16mm", description: "Soft film body" }
]

export const lensTypeOptions = [
  { value: "creative-tilt-lens", label: "Creative Tilt", description: "Stylized focus" },
  { value: "compact-anamorphic", label: "Compact Anamorphic", description: "Wide flare" },
  { value: "macro-prime", label: "Macro Prime", description: "Tight detail" },
  { value: "wide-rectilinear", label: "Wide Rectilinear", description: "Clean architecture" }
]

export const focalLengthOptions = ["18", "24", "35", "50", "85", "135"]

export const movementOptions = [
  { value: "locked-off", label: "Locked Off" },
  { value: "dolly", label: "Dolly" },
  { value: "tracking", label: "Tracking" },
  { value: "slow push-in", label: "Slow Push-In" },
  { value: "handheld", label: "Handheld" },
  { value: "subtle handheld", label: "Subtle Handheld" },
  { value: "crane", label: "Crane" },
  { value: "drone", label: "Drone" }
]

export const angleOptions = [
  { value: "eye-level", label: "Eye-Level" },
  { value: "low-angle", label: "Low Angle" },
  { value: "high-angle", label: "High Angle" },
  { value: "overhead", label: "Overhead" },
  { value: "dutch", label: "Dutch" },
  { value: "ground", label: "Ground" }
]

export const apertureOptions = [
  { value: "f/1.4", label: "F/1.4", description: "Creamy bokeh" },
  { value: "f/2.8", label: "F/2.8", description: "Balanced depth" },
  { value: "f/4", label: "F/4", description: "Controlled focus" },
  { value: "f/8", label: "F/8", description: "Deep focus" }
]

export const cameraBodyIcon = Camera
export const lensTypeIcon = Focus
export const apertureIcon = Aperture

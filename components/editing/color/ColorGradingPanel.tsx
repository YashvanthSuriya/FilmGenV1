"use client"

import { Palette } from "lucide-react"
import { ColorGradingPreview } from "@/components/editing/color/ColorGradingPreview"
import { ColorWheels } from "@/components/editing/color/ColorWheels"
import { CurvesEditor } from "@/components/editing/color/CurvesEditor"
import { CustomLUTUpload } from "@/components/editing/color/CustomLUTUpload"
import { LUTSelector } from "@/components/editing/color/LUTSelector"
import { ManualControls } from "@/components/editing/color/ManualControls"
import { Scopes } from "@/components/editing/color/Scopes"

export function ColorGradingPanel() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-accent-cyan" />
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Color Grading</h3>
      </div>
      <ColorGradingPreview />
      <LUTSelector />
      <ManualControls />
      <ColorWheels />
      <CurvesEditor />
      <Scopes />
      <CustomLUTUpload />
    </div>
  )
}

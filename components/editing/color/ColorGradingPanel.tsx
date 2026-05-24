"use client"

import { useState } from "react"
import { Palette } from "lucide-react"
import { ColorGradingPreview } from "@/components/editing/color/ColorGradingPreview"
import { ColorWheels } from "@/components/editing/color/ColorWheels"
import { CurvesEditor } from "@/components/editing/color/CurvesEditor"
import { CustomLUTUpload } from "@/components/editing/color/CustomLUTUpload"
import { LUTSelector } from "@/components/editing/color/LUTSelector"
import { ManualControls } from "@/components/editing/color/ManualControls"
import { Scopes } from "@/components/editing/color/Scopes"

type GradeTab = "primary" | "wheels" | "curves" | "look"

export function ColorGradingPanel() {
  const [tab, setTab] = useState<GradeTab>("primary")

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-accent-cyan" />
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Color Grading</h3>
      </div>
      <ColorGradingPreview />
      <div className="grid grid-cols-4 gap-1 rounded-[var(--radius-md)] border border-border-subtle bg-background p-1">
        {(["primary", "wheels", "curves", "look"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`h-8 rounded font-heading text-[10px] uppercase tracking-[0.08em] ${tab === item ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:text-text-primary"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "primary" ? <ManualControls /> : null}
      {tab === "wheels" ? <ColorWheels /> : null}
      {tab === "curves" ? <><CurvesEditor /><Scopes /></> : null}
      {tab === "look" ? <><LUTSelector /><CustomLUTUpload /></> : null}
    </div>
  )
}

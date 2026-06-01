"use client"

import { Mic, Play } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"

const voices = ["Ava - Warm Narrator", "Miles - Documentary", "Noor - Soft Drama", "Iris - Trailer"]

export function VoiceoverPanel() {
  const [script, setScript] = useState("The city exhaled neon, and she finally heard the truth.")
  const [voice, setVoice] = useState(voices[0])
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(0)
  const voiceovers = useProjectStore((state) => state.editingState.audioState.voiceovers)

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Voiceover</p>
      <textarea value={script} onChange={(event) => setScript(event.target.value)} className="min-h-20 w-full rounded-[var(--radius-md)] border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-accent-cyan" />
      <div className="mt-3 flex gap-2">
        <select className="h-10 min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-text-primary" value={voice} onChange={(event) => setVoice(event.target.value)}>
          {voices.map((item) => <option key={item}>{item}</option>)}
        </select>
        <Button size="icon" variant="ghost" aria-label="Preview voice">
          <Play className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Range label="Speed" value={speed} min={0.5} max={2} step={0.1} onChange={setSpeed} />
        <Range label="Pitch" value={pitch} min={-12} max={12} onChange={setPitch} />
      </div>
      <Button className="mt-3 w-full" variant="secondary" disabled title="Voice generation is intentionally absent from the frontend-only demo.">
        Demo Voice Direction
      </Button>
      <div className="mt-3 rounded border border-dashed border-border-subtle bg-background p-3 text-xs text-text-muted">
        <div className="mb-2 flex items-center gap-2 text-text-secondary">
          <Mic className="h-4 w-4 text-accent-red" />
          Static narration reference
        </div>
        {voiceovers[0] ? `${voiceovers[0].voice}, ${voiceovers[0].duration}s demo read` : "No narration reference selected."}
      </div>
    </section>
  )
}

function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}: {value}</span>
      <Input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

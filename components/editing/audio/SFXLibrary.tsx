"use client"

import { Search, Volume2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SfxCategory, SfxItem } from "@/lib/types"

const categories: SfxCategory[] = ["Ambient", "Foley", "Music", "Transitions", "Nature", "UI", "Weather", "Urban", "Interior", "Sci-Fi"]
const demoSfx: SfxItem[] = [
  { id: "rain-window", name: "Rain on window", category: "Weather", duration: 8 },
  { id: "city-night", name: "City night bed", category: "Urban", duration: 12 },
  { id: "cloth-step", name: "Soft cloth step", category: "Foley", duration: 2 },
  { id: "neon-hum", name: "Neon transformer hum", category: "Sci-Fi", duration: 6 },
  { id: "room-tone", name: "Apartment room tone", category: "Interior", duration: 10 },
  { id: "button-tap", name: "Glass UI tap", category: "UI", duration: 1 },
  { id: "forest-wind", name: "Forest wind", category: "Nature", duration: 9 },
  { id: "whoosh-soft", name: "Soft cinematic whoosh", category: "Transitions", duration: 3 }
]

export function SFXLibrary() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<SfxCategory>("Ambient")
  const results = useMemo(() => {
    const text = query.toLowerCase()
    return demoSfx.filter((item) => (category === "Ambient" || item.category === category) && item.name.toLowerCase().includes(text))
  }, [category, query])

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">SFX Library</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sounds" />
      </div>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} type="button" onClick={() => setCategory(item)} className={`h-8 shrink-0 rounded border px-2 font-heading text-[10px] uppercase tracking-[0.08em] ${category === item ? "border-accent-amber bg-accent-amber-dim text-accent-amber" : "border-border-subtle text-text-muted"}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {results.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded border border-border-subtle bg-background p-2">
            <Button size="icon" variant="ghost" aria-label={`Preview ${item.name}`}>
              <Volume2 className="h-4 w-4 text-accent-amber" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-text-primary">{item.name}</p>
              <p className="text-xs text-text-muted">{item.category} / {item.duration}s</p>
            </div>
            <Button size="icon" variant="ghost" aria-label={`${item.name} is static demo content`} disabled>
              <Volume2 className="h-4 w-4 text-text-muted" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

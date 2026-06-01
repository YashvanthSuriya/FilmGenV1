"use client"

import { useMemo, useState } from "react"
import { ImagePlus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useProjectStore } from "@/lib/stores/project"
import type { StyleCard } from "@/lib/types"

const chips = ["Cinematic", "Noir", "Ethereal", "High Contrast", "Pastel", "Cyberpunk", "Western", "Horror", "Documentary"]
const palette = ["#00E5FF", "#FFB800", "#9B59FF", "#151515", "#F0F0F0"]

export function StyleCardCreator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addStyleCard = useProjectStore((state) => state.addStyleCard)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [references, setReferences] = useState<string[]>([])
  const [error, setError] = useState("")

  const generatedImages = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) =>
        `linear-gradient(135deg, rgba(0,229,255,${0.12 + index * 0.015}), rgba(255,184,0,0.1), rgba(155,89,255,0.18))`
      ),
    []
  )

  if (!open) return null

  function addReference() {
    setReferences((current) => [...current, `linear-gradient(135deg, rgba(0,229,255,0.25), rgba(255,184,0,0.1))`])
  }

  function createCard() {
    setError("")
    if (!name.trim() || !description.trim()) {
      setError("Add a card name and style description first.")
      return
    }
    const styleCard: StyleCard = {
      id: `style-${Date.now()}`,
      name,
      description,
      referenceImages: references,
      generatedImages,
      keywords: description
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, 6),
      mood: "Dark / Dramatic / Cinematic",
      palette,
      primaryReference: references[0]
    }

    addStyleCard(styleCard)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between border-b border-border-subtle bg-surface px-5">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.08em] text-accent-cyan">Style Card Creator</p>
          <h2 className="font-heading text-lg font-bold text-text-primary">Build a visual language</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close style card creator">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid h-[calc(100vh-56px)] grid-cols-1 overflow-y-auto lg:grid-cols-2">
        <section className="space-y-5 border-b border-border-subtle p-5 lg:border-b-0 lg:border-r">
          <Card className="grid min-h-44 place-items-center border-dashed bg-background p-6 text-center">
            <ImagePlus className="mb-3 h-8 w-8 text-accent-cyan" />
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Reference Slot</p>
            <p className="mt-1 text-sm text-text-muted">Adds a static visual swatch for the demo session</p>
            <Button className="mt-4" onClick={addReference}>
              Add Reference
            </Button>
          </Card>

          {references.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {references.map((reference, index) => (
                <div
                  key={`${reference}-${index}`}
                  className="relative aspect-square rounded-[var(--radius-md)] border border-border-subtle bg-cover"
                  style={{ background: reference }}
                >
                  {index === 0 ? <Badge className="absolute left-2 top-2">Primary</Badge> : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="styleDescription">Describe Your Style</Label>
            <textarea
              id="styleDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Neon noir cinematic, rain-soaked streets, teal and orange color grading, 35mm film grain..."
              className="min-h-32 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-base text-text-primary outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan-dim"
            />
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setDescription((value) => `${value}${value ? ", " : ""}${chip}`)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Card Name</Label>
            <Input id="cardName" value={name} onChange={(event) => setName(event.target.value)} placeholder="Blade Runner Noir" />
          </div>

          {error ? <p className="text-sm text-accent-red">{error}</p> : null}
          <Button className="w-full bg-accent-cyan text-black hover:brightness-110" onClick={createCard}>
            <Sparkles className="mr-2 h-4 w-4" />
            SAVE DEMO STYLE
          </Button>
        </section>

        <section className="space-y-5 p-5">
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {generatedImages.map((gradient, index) => (
                <div key={index} className="aspect-[9/16] rounded-[var(--radius-md)] border border-border-subtle" style={{ background: gradient }} />
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Extracted Keywords</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(description ? description.split(/[\s,]+/).filter(Boolean).slice(0, 6) : ["cinematic", "contrast", "atmosphere"]).map((keyword) => (
                <Badge key={keyword} className="bg-accent-amber-dim text-accent-amber">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {palette.map((color) => (
                <span key={color} className="h-8 w-8 rounded-full border border-border" style={{ background: color }} />
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

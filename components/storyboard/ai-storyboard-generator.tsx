"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useProjectStore } from "@/lib/stores/project"
import type { StoryboardFrame } from "@/lib/types"

const models = ["ChatGPT Image 2.0", "NanoBanana 2", "NanoBanana Pro"]

export function AIStoryboardGenerator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const addStoryboardFrames = useProjectStore((state) => state.addStoryboardFrames)
  const spendCredits = useProjectStore((state) => state.spendCredits)
  const [description, setDescription] = useState("")
  const [shotCount, setShotCount] = useState(6)
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9")
  const [model, setModel] = useState(models[1])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [error, setError] = useState("")

  if (!open) return null

  function toggle(id: string, selected: string[], setSelected: (value: string[]) => void) {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  function generateFrames() {
    setError("")
    if (!description.trim()) {
      setError("Add a script or scene description first.")
      return
    }
    if (!spendCredits(shotCount, `Storyboard generation: ${shotCount} frames`)) {
      setError("Not enough credits for storyboard generation.")
      return
    }

    const references = styleCards
      .filter((card) => selectedStyles.includes(card.id))
      .flatMap((card) => card.generatedImages.slice(0, 2))

    const frames: StoryboardFrame[] = Array.from({ length: shotCount }, (_, index) => ({
      id: `shot-${Date.now()}-${index}`,
      title: `Shot ${index + 1}`,
      prompt: `${description} Shot ${index + 1}. ${selectedCharacters.length ? "Featuring selected cast." : ""}`,
      shotType: index % 3 === 0 ? "Wide" : index % 3 === 1 ? "Medium" : "Close-up",
      cameraMovement: index % 2 === 0 ? "Static" : "Dolly",
      aspectRatio,
      referenceImages: references,
      imageUrl: `linear-gradient(135deg, rgba(0,229,255,${0.16 + index * 0.02}), rgba(255,184,0,0.1), rgba(155,89,255,0.18))`
    }))

    addStoryboardFrames(frames)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.08em] text-accent-cyan">AI Storyboard Generator</p>
            <h2 className="font-heading text-2xl font-bold text-text-primary">Generate board frames</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close storyboard generator">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sceneDescription">Script / Scene Description</Label>
              <textarea
                id="sceneDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-40 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-base text-text-primary outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan-dim"
                placeholder="A lone courier crosses a flooded neon market while drones search overhead..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="shotCount">Shot Count</Label>
                <input
                  id="shotCount"
                  type="number"
                  min={1}
                  max={12}
                  value={shotCount}
                  onChange={(event) => setShotCount(Number(event.target.value))}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-text-primary outline-none focus:border-accent-cyan"
                />
              </div>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["16:9", "9:16"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`h-10 rounded-[var(--radius-md)] border font-heading text-xs uppercase tracking-[0.08em] ${
                        aspectRatio === ratio ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border text-text-secondary"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <select
                  id="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-text-primary outline-none focus:border-accent-cyan"
                >
                  {models.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div>
              <Label>Style Cards</Label>
              <div className="mt-2 space-y-2">
                {styleCards.length === 0 ? <p className="text-sm text-text-muted">No style cards yet.</p> : null}
                {styleCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggle(card.id, selectedStyles, setSelectedStyles)}
                    className={`w-full rounded-[var(--radius-md)] border p-2 text-left text-sm ${
                      selectedStyles.includes(card.id) ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border text-text-secondary"
                    }`}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Characters</Label>
              <div className="mt-2 space-y-2">
                {characters.length === 0 ? <p className="text-sm text-text-muted">No characters yet.</p> : null}
                {characters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => toggle(character.id, selectedCharacters, setSelectedCharacters)}
                    className={`w-full rounded-[var(--radius-md)] border p-2 text-left text-sm ${
                      selectedCharacters.includes(character.id) ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-border text-text-secondary"
                    }`}
                  >
                    {character.name}
                  </button>
                ))}
              </div>
            </div>
            <Badge className="bg-accent-amber-dim text-accent-amber">This will use {shotCount} credits</Badge>
          </aside>
        </div>

        {error ? <p className="mt-4 text-sm text-accent-red">{error}</p> : null}
        <div className="mt-5 flex justify-end">
          <Button className="bg-accent-cyan text-black hover:brightness-110" onClick={generateFrames}>
            GENERATE ({shotCount} CREDITS)
          </Button>
        </div>
      </Card>
    </div>
  )
}

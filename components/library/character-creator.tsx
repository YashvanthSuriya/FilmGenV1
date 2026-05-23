"use client"

import { useMemo, useState } from "react"
import { UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useProjectStore } from "@/lib/stores/project"
import type { Character } from "@/lib/types"

const roles = ["Hero", "Villain", "Supporting", "Narrator"]
const emotions = ["Neutral", "Happy", "Angry", "Fearful"]

export function CharacterCreator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const addCharacter = useProjectStore((state) => state.addCharacter)
  const spendCredits = useProjectStore((state) => state.spendCredits)
  const [name, setName] = useState("")
  const [role, setRole] = useState("Hero")
  const [description, setDescription] = useState("")
  const [styleCardIds, setStyleCardIds] = useState<string[]>([])
  const [error, setError] = useState("")

  const portraits = useMemo(
    () =>
      emotions.map(
        (_, index) =>
          `linear-gradient(135deg, rgba(0,229,255,${0.16 + index * 0.04}), rgba(255,184,0,0.08), rgba(155,89,255,0.18))`
      ),
    []
  )

  if (!open) return null

  function toggleStyleCard(id: string) {
    setStyleCardIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function createCharacter() {
    setError("")
    if (!name.trim()) {
      setError("Add a character name first.")
      return
    }
    if (!spendCredits(4, `Character portraits: ${name}`)) {
      setError("Not enough credits for character generation.")
      return
    }

    const character: Character = {
      id: `character-${Date.now()}`,
      name,
      role,
      description,
      emotions,
      portraitUrls: portraits,
      styleCardIds
    }

    addCharacter(character)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between border-b border-border-subtle bg-surface px-5">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.08em] text-accent-cyan">Character Creator</p>
          <h2 className="font-heading text-lg font-bold text-text-primary">Build a cast member</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close character creator">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid h-[calc(100vh-56px)] grid-cols-1 overflow-y-auto lg:grid-cols-2">
        <section className="space-y-5 border-b border-border-subtle p-5 lg:border-b-0 lg:border-r">
          <Card className="grid min-h-40 place-items-center border-dashed bg-background p-6 text-center">
            <UserPlus className="mb-3 h-8 w-8 text-accent-cyan" />
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Add portrait reference</p>
            <p className="mt-1 text-sm text-text-muted">Portrait images, face sheets, or concept stills</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="characterName">Name</Label>
              <Input id="characterName" value={name} onChange={(event) => setName(event.target.value)} placeholder="Mira Vale" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="characterRole">Role</Label>
              <select
                id="characterRole"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-text-primary outline-none focus:border-accent-cyan"
              >
                {roles.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterDescription">Physical Description</Label>
            <textarea
              id="characterDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-32 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-base text-text-primary outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan-dim"
              placeholder="Sharp cheekbones, short silver hair, raincoat, calm but dangerous..."
            />
          </div>

          <div className="space-y-2">
            <Label>Style Association</Label>
            <div className="flex flex-wrap gap-2">
              {styleCards.length === 0 ? <p className="text-sm text-text-muted">Create a style card to link visual direction.</p> : null}
              {styleCards.map((styleCard) => (
                <button
                  key={styleCard.id}
                  type="button"
                  onClick={() => toggleStyleCard(styleCard.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    styleCardIds.includes(styleCard.id)
                      ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
                      : "border-border text-text-secondary hover:border-accent-cyan"
                  }`}
                >
                  {styleCard.name}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-accent-red">{error}</p> : null}
          <Button className="w-full bg-accent-cyan text-black hover:brightness-110" onClick={createCharacter}>
            SAVE CHARACTER (4 CREDITS)
          </Button>
        </section>

        <section className="space-y-5 p-5">
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {portraits.map((portrait, index) => (
                <div key={emotions[index]} className="overflow-hidden rounded-[var(--radius-md)] border border-border-subtle">
                  <div className="aspect-square" style={{ background: portrait }} />
                  <div className="border-t border-border-subtle bg-elevated px-3 py-2">
                    <Badge>{emotions[index]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Film, ImagePlus, Library, Plus, Sparkles, UserPlus } from "lucide-react"
import { StoryboardFrameCard } from "@/components/cards/storyboard/storyboard-frame-card"
import { StyleCardCreator } from "@/components/library/style-card-creator"
import { CharacterCreator } from "@/components/library/character-creator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useProjectStore } from "@/lib/stores/project"
import type { StoryboardFrame, StoryboardStitch } from "@/lib/types"

export function StoryboardWorkspace() {
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const frames = useProjectStore((state) => state.storyboardFrames)
  const stitches = useProjectStore((state) => state.storyboardStitches)
  const addStoryboardFrames = useProjectStore((state) => state.addStoryboardFrames)
  const createStoryboardStitch = useProjectStore((state) => state.createStoryboardStitch)
  const [styleOpen, setStyleOpen] = useState(false)
  const [characterOpen, setCharacterOpen] = useState(false)
  const [view, setView] = useState<"grid" | "list" | "storyboard">("grid")

  function addShot() {
    addStoryboardFrames([
      {
        id: `shot-manual-${Date.now()}`,
        title: `Shot ${frames.length + 1}`,
        prompt: "Beat: describe the story moment. Prompt: subject, action, mood, lighting, and camera intent.",
        shotType: "Wide",
        cameraMovement: "Static",
        aspectRatio: "16:9",
        referenceImages: []
      }
    ])
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] bg-background">
      <div className="grid min-h-[calc(100vh-var(--nav-height))] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border-subtle bg-surface lg:border-b-0 lg:border-r">
          <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-4">
            <Library className="h-4 w-4 text-accent-cyan" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Library</h2>
          </div>

          <div className="space-y-5 p-4">
            <LibrarySection
              title="Style Cards"
              count={styleCards.length}
              onAdd={() => setStyleOpen(true)}
              empty="Create a visual style pack."
            >
              {styleCards.map((card) => (
                <Card key={card.id} className="overflow-hidden">
                  <div className="aspect-video" style={{ background: card.generatedImages[0] }} />
                  <div className="p-3">
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">{card.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-text-muted">{card.description}</p>
                  </div>
                </Card>
              ))}
            </LibrarySection>

            <LibrarySection
              title="Characters"
              count={characters.length}
              onAdd={() => setCharacterOpen(true)}
              empty="Create a cast member."
            >
              {characters.map((character) => (
                <Card key={character.id} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 rounded-[var(--radius-md)] border border-border-subtle" style={{ background: character.portraitUrls[0] }} />
                  <div>
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">{character.name}</p>
                    <Badge className="mt-1 bg-accent-amber-dim text-accent-amber">{character.role}</Badge>
                  </div>
                </Card>
              ))}
            </LibrarySection>

            <LibrarySection title="Assets" count={0} onAdd={() => undefined} empty="Demo assets are shown in the editing workspace." />
          </div>
        </aside>

        <main className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge>Storyboard</Badge>
              <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">Shot pipeline</h1>
              <p className="mt-1 text-sm text-text-muted">Plan each shot as a beat, camera setup, generated frame, then send it to workspace or editing.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-[var(--radius-md)] border border-border bg-surface p-1">
                {(["grid", "list", "storyboard"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setView(item)}
                    className={`h-8 rounded px-3 font-heading text-xs uppercase tracking-[0.08em] ${
                      view === item ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Button variant="secondary" disabled title="PDF export is intentionally absent from the frontend-only demo.">PDF Disabled</Button>
              <Button variant="secondary" onClick={() => setView("storyboard")}>
                <Sparkles className="h-4 w-4" />
                Stitch
              </Button>
              <Button className="bg-accent-cyan text-black hover:brightness-110" onClick={addShot}>
                Add Shot
              </Button>
            </div>
          </div>

          {frames.length === 0 ? (
            <Card className="grid min-h-[520px] place-items-center border-dashed p-6 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[var(--radius-xl)] border border-accent-cyan bg-accent-cyan-dim">
                  <Film className="h-9 w-9 text-accent-cyan" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-text-primary">Add your first shot to begin</h2>
                <p className="mt-2 text-text-secondary">Build frames manually with static demo imagery and editable shot notes.</p>
                <Button className="mt-5 bg-accent-cyan text-black hover:brightness-110" onClick={addShot}>
                  Add Shot
                </Button>
              </div>
            </Card>
          ) : view === "storyboard" ? (
            <StitchedStoryboard frames={frames} stitches={stitches} onCreate={createStoryboardStitch} onAddShot={addShot} />
          ) : (
            <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}>
              {frames.map((frame, index) => (
                <StoryboardFrameCard key={frame.id} frame={frame} index={index} />
              ))}
              <button
                type="button"
                onClick={addShot}
                className="grid min-h-60 place-items-center rounded-[var(--radius-lg)] border border-dashed border-border bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan"
              >
                <span className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.08em]">
                  <Plus className="h-4 w-4" />
                  Add Shot
                </span>
              </button>
            </div>
          )}
        </main>
      </div>

      <StyleCardCreator open={styleOpen} onClose={() => setStyleOpen(false)} />
      <CharacterCreator open={characterOpen} onClose={() => setCharacterOpen(false)} />
    </div>
  )
}

function StitchedStoryboard({
  frames,
  stitches,
  onCreate,
  onAddShot
}: {
  frames: StoryboardFrame[]
  stitches: StoryboardStitch[]
  onCreate: (input: { frameIds: string[]; title: string; feedback: string }) => unknown
  onAddShot: () => void
}) {
  const [selectedIds, setSelectedIds] = useState(() => frames.map((frame) => frame.id))
  const [feedback, setFeedback] = useState("Keep panel continuity, readable cinematic framing, and clear shot order.")
  const [title, setTitle] = useState("Stitched Storyboard")
  const latest = stitches[0]

  function toggleFrame(frameId: string) {
    setSelectedIds((current) => (current.includes(frameId) ? current.filter((id) => id !== frameId) : [...current, frameId]))
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">Sequence Strip</h2>
          <p className="mt-1 text-sm text-text-muted">Select shots, stitch a contact sheet, then prepare a provider-ready AI storyboard prompt.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={onAddShot}>
          <Plus className="h-4 w-4" />
          Add Shot
        </Button>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border-subtle bg-background p-3">
        <div className="flex min-w-max gap-3">
          {frames.map((frame, index) => (
            <article key={frame.id} className={`w-72 shrink-0 overflow-hidden rounded-[var(--radius-md)] border bg-elevated ${selectedIds.includes(frame.id) ? "border-accent-cyan" : "border-border-subtle opacity-55"}`}>
              <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
                <p className="font-heading text-xs uppercase tracking-[0.08em] text-accent-cyan">SH-{String(index + 1).padStart(2, "0")}</p>
                <button type="button" onClick={() => toggleFrame(frame.id)} className="font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted hover:text-accent-cyan">
                  {selectedIds.includes(frame.id) ? "Included" : "Skipped"}
                </button>
              </div>
              <div
                className="aspect-video bg-cover bg-center"
                style={{
                  background:
                    frame.imageUrl ??
                    "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(255,184,0,0.08), rgba(155,89,255,0.18))"
                }}
              />
              <div className="p-3">
                <h3 className="mt-1 truncate font-heading text-sm font-semibold text-text-primary">{frame.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs text-text-muted">{frame.prompt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      </section>
      <aside className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">AI Stitch Prep</h2>
        <p className="mt-1 text-sm text-text-muted">Provider-ready mock for a future image model adapter. No paid API call runs here.</p>
        <label className="mt-4 block">
          <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-accent-cyan" />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Feedback / Prompt Injection</span>
          <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} className="min-h-28 w-full rounded border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-accent-cyan" />
        </label>
        <Button className="mt-3 w-full bg-accent-cyan text-black hover:brightness-110" onClick={() => onCreate({ frameIds: selectedIds, title, feedback })} disabled={selectedIds.length === 0}>
          <Sparkles className="h-4 w-4" />
          Build Stitch Payload
        </Button>
        {latest ? (
          <div className="mt-4 space-y-3">
            <div className="aspect-video rounded border border-border-subtle bg-cover bg-center" style={{ backgroundImage: latest.imageUrl.startsWith("data:") ? `url(${latest.imageUrl})` : latest.imageUrl }} />
            <textarea readOnly value={latest.promptPayload} className="min-h-40 w-full rounded border border-border-subtle bg-background p-3 text-xs text-text-secondary" />
          </div>
        ) : null}
      </aside>
      </div>
    </section>
  )
}

function LibrarySection({
  title,
  count,
  onAdd,
  empty,
  children
}: {
  title: string
  count: number
  onAdd: () => void
  empty: string
  children?: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{title}</h3>
          <Badge>{count}</Badge>
        </div>
        <button type="button" onClick={onAdd} className="rounded p-1 text-text-muted transition hover:bg-elevated hover:text-accent-cyan" aria-label={`Add ${title}`}>
          {title === "Characters" ? <UserPlus className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
        </button>
      </div>
      <div className="space-y-3">{count === 0 ? <p className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3 text-sm text-text-muted">{empty}</p> : children}</div>
    </section>
  )
}

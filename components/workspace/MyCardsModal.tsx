"use client"

import { useState } from "react"
import { Layers3, Palette, Plus, UserRound, X, Zap } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { CreateCardModal } from "@/components/workspace/CreateCardModal"
import { cn } from "@/lib/utils"
import type { WorkspaceNodeType } from "@/lib/types"

type CardCategory = "style" | "character" | "action"

const categories: Array<{ value: CardCategory; label: string; icon: typeof Palette; nodeType: WorkspaceNodeType; dataKey: "styleCardId" | "characterId" | "actionCardId" }> = [
  { value: "style", label: "Style Cards", icon: Palette, nodeType: "styleCard", dataKey: "styleCardId" },
  { value: "character", label: "Characters", icon: UserRound, nodeType: "character", dataKey: "characterId" },
  { value: "action", label: "Action Cards", icon: Zap, nodeType: "actionCard", dataKey: "actionCardId" }
]

export function MyCardsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const addNode = useWorkspaceStore((state) => state.addNode)
  const [activeCategory, setActiveCategory] = useState<CardCategory>("style")
  const [createOpen, setCreateOpen] = useState(false)

  if (!open) return null

  function addToWorkspace(category: CardCategory, cardId: string, cardName: string) {
    const cat = categories.find((c) => c.value === category)!
    // Build the data object with the correct field for each node type.
    // Using explicit property names (not computed keys) to avoid type issues.
    const data: Record<string, unknown> = { label: cardName }
    if (category === "style") data.styleCardId = cardId
    else if (category === "character") data.characterId = cardId
    else if (category === "action") data.actionCardId = cardId

    addNode(cat.nodeType, { x: 200, y: 200 }, data as never)
    onClose()
  }

  const items: Array<{ id: string; name: string; description: string; thumbnail?: string }> = (() => {
    if (activeCategory === "style") {
      return styleCards.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        thumbnail: s.generatedImages[0] ?? s.referenceImages[0]
      }))
    }
    if (activeCategory === "character") {
      return characters.map((c) => ({
        id: c.id,
        name: c.name,
        description: `${c.role}: ${c.description}`,
        thumbnail: c.portraitUrls[0]
      }))
    }
    return actionCards.map((a) => ({
      id: a.id,
      name: a.title,
      description: a.beat,
      thumbnail: undefined
    }))
  })()

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.2rem] border border-border-subtle bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-(--radius-md) bg-accent-cyan-dim text-accent-cyan">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">My Cards</p>
              <h2 className="font-heading text-lg font-bold text-text-primary">Saved creative cards</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-(--radius-md) bg-accent-cyan px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-black transition hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-text-muted hover:border-accent-red hover:text-accent-red"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Category tabs */}
        <div className="flex gap-1 border-b border-border-subtle px-5 py-2">
          {categories.map(({ value, label, icon: Icon }) => {
            const count = value === "style" ? styleCards.length : value === "character" ? characters.length : actionCards.length
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveCategory(value)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-(--radius-sm) px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition",
                  activeCategory === value ? "bg-accent-cyan text-black" : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className={cn("ml-0.5 rounded-full px-1 text-[9px]", activeCategory === value ? "bg-black/20" : "bg-border-subtle")}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Cards list */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="grid min-h-[200px] place-items-center rounded-(--radius-md) border border-dashed border-border-subtle p-6 text-center">
              <div>
                <p className="font-heading text-sm font-semibold text-text-primary">No {activeCategory} cards yet</p>
                <p className="mt-1 text-[11px] text-text-secondary">Generate images in the Storyboard tab and save them to a library to create cards.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-(--radius-md) border border-border-subtle bg-background p-2.5 transition hover:border-accent-cyan/40"
                >
                  {item.thumbnail ? (
                    <div
                      className="h-14 w-20 shrink-0 rounded-sm border border-border-subtle bg-cover bg-center"
                      style={{
                        backgroundImage: item.thumbnail.startsWith("linear-gradient")
                          ? item.thumbnail
                          : `url("${item.thumbnail}")`
                      }}
                    />
                  ) : (
                    <div className="grid h-14 w-20 shrink-0 place-items-center rounded-sm border border-border-subtle bg-elevated">
                      <Zap className="h-5 w-5 text-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-text-secondary">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToWorkspace(activeCategory, item.id, item.name)}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-(--radius-sm) bg-accent-cyan px-3 text-[11px] font-semibold text-black transition hover:brightness-110"
                  >
                    Add to canvas
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CreateCardModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

"use client"

import { useEffect, useMemo } from "react"
import { Clock3, Film, Layers3, Play, SlidersHorizontal, Sparkles, Volume2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useProjectStore } from "@/lib/stores/project"
import type { ProjectAsset, TimelineClip } from "@/lib/types"

const PLACEHOLDER_STATUS = [
  "Preview surface reserved",
  "Timeline shell reserved",
  "Render bridge reserved"
] as const

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function getTimelineDuration(clips: TimelineClip[]) {
  return clips.reduce((duration, clip) => Math.max(duration, clip.start + clip.duration), 0)
}

function getAssetCounts(assets: ProjectAsset[]) {
  return assets.reduce<Record<ProjectAsset["type"], number>>(
    (counts, asset) => {
      counts[asset.type] += 1
      return counts
    },
    { image: 0, video: 0, audio: 0 }
  )
}

export function EditorPlaceholder() {
  const projectName = useProjectStore((state) => state.projectName)
  const assets = useProjectStore((state) => state.assets)
  const editingState = useProjectStore((state) => state.editingState)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const removedScope = `${window.location.origin}/freecut-editor/`
        for (const registration of registrations) {
          if (registration.scope === removedScope) {
            registration.unregister().catch(() => undefined)
          }
        }
      })
      .catch(() => undefined)
  }, [])

  const timelineDuration = useMemo(() => getTimelineDuration(editingState.clips), [editingState.clips])
  const assetCounts = useMemo(() => getAssetCounts(assets), [assets])
  const visibleTracks = editingState.tracks.slice(0, 4)
  const timelineScale = Math.max(timelineDuration, 15)

  return (
    <main className="min-h-[calc(100vh-var(--nav-height))] bg-background px-4 py-5 text-text-primary sm:px-5">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan">
                Editing
              </p>
              <h1 className="mt-2 truncate font-heading text-3xl font-bold text-text-primary">
                {projectName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                The editor tab is open for the native FilmGen editor. FreeCut has been removed from this surface.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface px-3 py-2 text-xs text-text-secondary">
              <Clock3 className="h-4 w-4 text-accent-cyan" />
              <span>{formatDuration(timelineDuration)}</span>
            </div>
          </div>

          <section className="grid min-h-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-[#050708] shadow-lg shadow-black/30">
            <div className="grid min-h-[300px] place-items-center border-b border-border-subtle p-5 text-center">
              <div className="w-full max-w-3xl">
                <div className="mx-auto grid aspect-video w-full max-w-2xl place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-background">
                  <div className="grid gap-4 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-[var(--radius-md)] border border-accent-cyan bg-accent-cyan-dim">
                      <Film className="h-8 w-8 text-accent-cyan" />
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-text-primary">
                        Native editor placeholder
                      </h2>
                      <p className="mt-2 text-sm text-text-secondary">
                        Media playback and editing controls will attach here in the editor phase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Preview playback unavailable"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled
                  className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Audio controls unavailable"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-elevated">
                <div className="h-full w-1/3 rounded-full bg-accent-cyan" />
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <SlidersHorizontal className="h-4 w-4 text-accent-amber" />
                <span>Controls pending</span>
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Timeline
                </p>
                <h2 className="font-heading text-lg font-semibold text-text-primary">Reserved track layout</h2>
              </div>
              <span className="shrink-0 text-xs text-text-muted">{editingState.clips.length} clips</span>
            </div>

            <div className="grid gap-2">
              {visibleTracks.map((track) => {
                const trackClips = editingState.clips.filter((clip) => clip.trackId === track.id)
                return (
                  <div key={track.id} className="grid min-h-14 grid-cols-[92px_1fr] overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-background">
                    <div className="flex items-center border-r border-border-subtle px-3 text-xs text-text-secondary">
                      <span className="truncate">{track.name}</span>
                    </div>
                    <div className="relative min-h-14 overflow-hidden">
                      {trackClips.length === 0 ? (
                        <div className="flex h-full items-center px-3 text-xs text-text-muted">Empty</div>
                      ) : (
                        trackClips.map((clip) => {
                          const left = Math.min(92, (clip.start / timelineScale) * 100)
                          const width = Math.max(8, Math.min(100 - left, (clip.duration / timelineScale) * 100))
                          return (
                            <div
                              key={clip.id}
                              className="absolute top-2 flex h-10 items-center overflow-hidden rounded-[var(--radius-sm)] border border-accent-cyan bg-accent-cyan-dim px-2 text-xs text-accent-cyan"
                              style={{ left: `${left}%`, width: `${width}%` }}
                              title={clip.name}
                            >
                              <span className="truncate">{clip.name}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-accent-cyan-dim text-accent-cyan">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Project Media
                </p>
                <p className="font-heading text-xl font-bold text-text-primary">{assets.length} assets</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Images</dt>
                <dd className="text-text-primary">{assetCounts.image}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Videos</dt>
                <dd className="text-text-primary">{assetCounts.video}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Audio</dt>
                <dd className="text-text-primary">{assetCounts.audio}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-accent-amber-dim text-accent-amber">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Native Editor
                </p>
                <p className="font-heading text-xl font-bold text-text-primary">Reserved</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {PLACEHOLDER_STATUS.map((item) => (
                <div key={item} className="rounded-[var(--radius-md)] border border-border-subtle bg-background px-3 py-2 text-sm text-text-secondary">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  )
}

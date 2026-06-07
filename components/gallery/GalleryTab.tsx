"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { ArrowLeft, ArrowRight, Check, Info, Loader2, Maximize2, Pause, Play, Plus, RotateCcw, Share2, Volume2, X } from "lucide-react"
import { CardStack } from "@/components/ui/card-stack"
import { galleryVideos, useGalleryStore, type GalleryVideo } from "@/lib/stores/gallery"
import { useProjectStore } from "@/lib/stores/project"

const galleryRows: Array<{ id: GalleryVideo["rows"][number]; title: string }> = [
  { id: "continue", title: "Continue Watching" },
  { id: "top", title: "Top Picks" },
  { id: "generated", title: "AI Generated" },
  { id: "winners", title: "Challenge Winners" },
  { id: "recent", title: "Recently Added" }
]

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",")

export function GalleryTab() {
  const featuredIndex = useGalleryStore((state) => state.featuredIndex)
  const selectedVideoId = useGalleryStore((state) => state.selectedVideoId)
  const playerVideoId = useGalleryStore((state) => state.playerVideoId)
  const setFeaturedIndex = useGalleryStore((state) => state.setFeaturedIndex)
  const selectVideo = useGalleryStore((state) => state.selectVideo)
  const openPlayer = useGalleryStore((state) => state.openPlayer)
  const featuredVideo = galleryVideos[featuredIndex] ?? galleryVideos[0]
  const selectedVideo = galleryVideos.find((video) => video.id === selectedVideoId) ?? null
  const playerVideo = galleryVideos.find((video) => video.id === playerVideoId) ?? null

  return (
    <main className="min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-[#030506] text-text-primary">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <img src={featuredVideo.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,6,0.96)_0%,rgba(3,5,6,0.72)_46%,rgba(3,5,6,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#030506] to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-[650px] w-full max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end lg:px-12">
          <div className="pb-10">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-accent-cyan">FilmGen Gallery</p>
            <h1 className="mt-5 max-w-2xl font-heading text-5xl font-bold leading-none text-white md:text-7xl">{featuredVideo.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{featuredVideo.synopsis}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
              <span>{featuredVideo.duration}</span>
              <span>-</span>
              <span>{featuredVideo.genres.join(" / ")}</span>
              <span>-</span>
              <span>{featuredVideo.year}</span>
              <span>-</span>
              <span>{featuredVideo.model}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => openPlayer(featuredVideo.id)} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-white px-5 font-heading text-sm font-bold uppercase tracking-[0.08em] text-black transition hover:bg-accent-cyan">
                <Play className="h-4 w-4 fill-current" />
                Play
              </button>
              <button type="button" onClick={() => selectVideo(featuredVideo.id)} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-5 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-white backdrop-blur transition hover:border-accent-cyan hover:text-accent-cyan">
                <Info className="h-4 w-4" />
                More Info
              </button>
            </div>
          </div>

          <div className="min-w-0 pb-4">
            <CardStack
              items={galleryVideos.slice(0, 6)}
              initialIndex={featuredIndex % 6}
              cardWidth={520}
              cardHeight={292}
              maxVisible={3}
              overlap={0.58}
              spreadDeg={20}
              springStiffness={200}
              springDamping={24}
              activeLiftPx={16}
              autoAdvance
              intervalMs={8000}
              showDots
              className="mx-auto max-w-[660px]"
              onChangeIndex={(index) => setFeaturedIndex(index)}
              onSelectItem={(index) => setFeaturedIndex(index)}
              renderCard={(item, { active }) => {
                const video = galleryVideos.find((entry) => entry.id === item.id) ?? featuredVideo
                return <HeroStackCard video={video} active={active} />
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-9 px-4 py-8 md:px-8 lg:px-12">
        {galleryRows.map((row) => (
          <VideoRow key={row.id} title={row.title} videos={galleryVideos.filter((video) => video.rows.includes(row.id))} onSelect={selectVideo} />
        ))}
      </section>

      {selectedVideo ? <VideoDetailModal video={selectedVideo} /> : null}
      {playerVideo ? <VideoPlayerOverlay video={playerVideo} /> : null}
    </main>
  )
}

function HeroStackCard({ video, active }: { video: GalleryVideo; active: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[var(--radius-md)] border ${active ? "border-accent-cyan" : "border-white/10"} bg-black shadow-2xl`}>
      <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-cyan">{video.genres[0]}</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-white">{video.title}</h2>
        <p className="mt-1 text-sm text-white/70">{video.duration} - {video.resolution}</p>
      </div>
    </div>
  )
}

function VideoRow({ title, videos, onSelect }: { title: string; videos: GalleryVideo[]; onSelect: (videoId: string) => void }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  function scroll(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }

  return (
    <section className="group/row">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-text-primary">{title}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-520)} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label={`Scroll ${title} left`}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => scroll(520)} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label={`Scroll ${title} right`}>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
        {videos.map((video) => (
          <button key={video.id} type="button" onClick={() => onSelect(video.id)} className="group/card relative aspect-video w-[260px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-surface text-left shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:border-accent-cyan hover:shadow-cyan md:w-[320px]">
            <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/10 to-transparent opacity-90 transition group-hover/card:opacity-100" />
            <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold text-white/80">{video.duration}</span>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-heading text-lg font-bold text-white">{video.title}</h3>
              <p className="mt-1 text-xs text-white/65">{video.genres.join(" / ")}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function VideoDetailModal({ video }: { video: GalleryVideo }) {
  const closeDetail = useGalleryStore((state) => state.closeDetail)
  const openPlayer = useGalleryStore((state) => state.openPlayer)
  const markAdded = useGalleryStore((state) => state.markAdded)
  const markShared = useGalleryStore((state) => state.markShared)
  const addedVideoIds = useGalleryStore((state) => state.addedVideoIds)
  const sharedVideoId = useGalleryStore((state) => state.sharedVideoId)
  const importAsset = useProjectStore((state) => state.importAsset)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const relatedVideos = useMemo(
    () => galleryVideos.filter((item) => item.id !== video.id && item.genres.some((genre) => video.genres.includes(genre))).slice(0, 6),
    [video]
  )
  const added = addedVideoIds.includes(video.id)

  useEffect(() => {
    modalRef.current?.focus()
  }, [video.id])

  function addToProject() {
    importAsset({
      id: `gallery-${video.id}-${Date.now()}`,
      source: "workspace",
      type: "video",
      name: video.title,
      prompt: video.synopsis,
      thumbnailUrl: video.thumbnailUrl,
      url: `demo://gallery/${video.id}`,
      duration: Number.parseInt(video.duration, 10),
      createdAt: new Date().toISOString()
    })
    markAdded(video.id)
  }

  function shareVideo() {
    const shareUrl = `${window.location.origin}/studio?tab=gallery&video=${video.id}`
    void navigator.clipboard?.writeText(shareUrl)
    markShared(video.id)
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="gallery-detail-title" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, closeDetail)} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-md md:p-6">
      <div className="mx-auto min-h-full max-w-6xl overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#07090b] shadow-2xl">
        <section className="relative min-h-[520px] overflow-hidden">
          <img src={video.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/56 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07090b] to-transparent" />
          <button type="button" onClick={closeDetail} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close video details">
            <X className="h-5 w-5" />
          </button>
          <div className="relative z-10 max-w-3xl p-6 pt-24 md:p-10 md:pt-32">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-accent-cyan">{video.styleName}</p>
            <h2 id="gallery-detail-title" className="mt-4 font-heading text-5xl font-bold leading-none text-white md:text-7xl">{video.title}</h2>
            <p className="mt-5 text-sm leading-6 text-white/80 md:text-base md:leading-7">{video.synopsis}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
              {[video.duration, video.genres.join(" / "), video.year, video.model, video.resolution].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => openPlayer(video.id)} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-accent-cyan px-5 font-heading text-sm font-bold uppercase tracking-[0.08em] text-black transition hover:brightness-110">
                <Play className="h-4 w-4 fill-current" />
                Play
              </button>
              <button type="button" onClick={addToProject} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-5 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:border-accent-cyan hover:text-accent-cyan">
                {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {added ? "Added" : "Add to Project"}
              </button>
              <button type="button" onClick={shareVideo} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] px-4 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:bg-white/10 hover:text-white">
                <Share2 className="h-4 w-4" />
                {sharedVideoId === video.id ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6 px-6 pb-8 md:px-10">
          <div>
            <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Actor Cards</p>
            <div className="flex flex-wrap gap-2">
              {video.characterTags.map((tag) => (
                <span key={tag} className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-sm text-text-secondary">{tag}</span>
              ))}
              <span className="rounded-full border border-accent-cyan bg-accent-cyan-dim px-3 py-1 text-sm text-accent-cyan">{video.styleName}</span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-xl font-bold text-text-primary">Related films</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {relatedVideos.map((related) => (
                <button key={related.id} type="button" onClick={() => useGalleryStore.getState().selectVideo(related.id)} className="w-56 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-surface text-left transition hover:border-accent-cyan">
                  <img src={related.thumbnailUrl} alt={related.title} className="aspect-video w-full object-cover" loading="lazy" />
                  <div className="p-3">
                    <p className="font-heading text-sm font-semibold text-text-primary">{related.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{related.duration} - {related.resolution}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function VideoPlayerOverlay({ video }: { video: GalleryVideo }) {
  const closePlayer = useGalleryStore((state) => state.closePlayer)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(72)
  const [quality, setQuality] = useState<GalleryVideo["resolution"]>(video.resolution)
  const [fullscreen, setFullscreen] = useState(false)
  const complete = progress >= 100
  const playerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setLoading(false)
      setPlaying(true)
    }, 1200)
    return () => window.clearTimeout(loadingTimer)
  }, [video.id])

  useEffect(() => {
    if (!playing || loading || complete) return undefined
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(100, value + 4))
    }, 100)
    return () => window.clearInterval(timer)
  }, [complete, loading, playing])

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") closePlayer()
      if (event.key === " ") {
        event.preventDefault()
        if (!loading && !complete) setPlaying((value) => !value)
      }
      if (event.key === "ArrowRight") setProgress((value) => Math.min(100, value + 10))
      if (event.key === "ArrowLeft") setProgress((value) => Math.max(0, value - 10))
      if (event.key === "ArrowUp") setVolume((value) => Math.min(100, value + 10))
      if (event.key === "ArrowDown") setVolume((value) => Math.max(0, value - 10))
      if (event.key.toLowerCase() === "f") setFullscreen((value) => !value)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [closePlayer, complete, loading])

  function replay() {
    setProgress(0)
    setPlaying(true)
  }

  return (
    <div ref={playerRef} role="dialog" aria-modal="true" aria-label={`${video.title} player`} tabIndex={-1} onKeyDown={(event) => trapFocus(event, playerRef.current, closePlayer)} className="fixed inset-0 z-[60] grid place-items-center bg-black p-4">
      <button type="button" onClick={closePlayer} className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close video player">
        <X className="h-5 w-5" />
      </button>
      <div className={`${fullscreen ? "h-full w-full" : "w-full max-w-6xl"} overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#030506] shadow-2xl`}>
        <div className="relative aspect-video bg-black">
          <img src={video.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="eager" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(0,229,255,0.26),transparent_28%),linear-gradient(120deg,rgba(0,0,0,0.2),rgba(0,0,0,0.74))]" />
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute inset-0 grid place-items-center">
            {loading ? (
              <div className="grid place-items-center gap-3 text-accent-cyan">
                <Loader2 className="h-10 w-10 animate-spin" />
                <span className="font-heading text-xs font-semibold uppercase tracking-[0.16em]">FilmGen stream loading</span>
              </div>
            ) : complete ? (
              <div className="text-center">
                <h2 className="font-heading text-4xl font-bold text-white">{video.title}</h2>
                <p className="mt-2 text-sm text-white/60">Playback complete</p>
                <div className="mt-5 flex justify-center gap-3">
                  <button type="button" onClick={replay} className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-white px-4 font-heading text-xs font-bold uppercase tracking-[0.08em] text-black">
                    <RotateCcw className="h-4 w-4" />
                    Replay
                  </button>
                  <button type="button" onClick={closePlayer} className="h-11 rounded-[var(--radius-md)] border border-white/20 px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-white">
                    Back to Gallery
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
                  {playing ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9 fill-current" />}
                </div>
                <h2 className="font-heading text-4xl font-bold text-white">{video.title}</h2>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4 border-t border-white/10 bg-black/80 p-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
          <button type="button" disabled={loading || complete} onClick={() => setPlaying((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-white px-4 text-sm font-semibold text-black disabled:opacity-50">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            {playing ? "Pause" : "Play"}
          </button>
          <label className="grid gap-1 text-xs text-white/60">
            Progress
            <input type="range" min={0} max={100} value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="accent-accent-cyan" aria-label="Playback progress" />
          </label>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <Volume2 className="h-4 w-4" />
            <input type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-24 accent-accent-cyan" aria-label="Volume" />
          </label>
          <select value={quality} onChange={(event) => setQuality(event.target.value as GalleryVideo["resolution"])} className="h-10 rounded-[var(--radius-md)] border border-white/10 bg-white/10 px-3 text-sm text-white outline-none" aria-label="Playback quality">
            {(["480p", "720p", "1080p"] as const).map((item) => (
              <option key={item} value={item} className="bg-black">{item}</option>
            ))}
          </select>
          <button type="button" onClick={() => setFullscreen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-white/10 text-white/70 transition hover:text-white" aria-label="Toggle fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function trapFocus(event: KeyboardEvent<HTMLDivElement>, root: HTMLElement | null, onEscape: () => void) {
  if (event.key === "Escape") {
    event.stopPropagation()
    onEscape()
    return
  }
  if (event.key !== "Tab" || !root) return
  const focusable = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.hasAttribute("disabled"))
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

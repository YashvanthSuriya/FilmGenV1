import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AudioLines,
  Clapperboard,
  Download,
  Film,
  ImagePlus,
  LoaderCircle,
  Palette,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Sparkles,
  Upload,
  WandSparkles,
} from 'lucide-react'
import type { MediaAsset, StylePackImage } from './domain/types'
import { getCreditPrice, videoFeatureForResolution } from './lib/creditPricing'
import { formatTimecode } from './lib/timecode'
import { registerOmniclipElements, timelineActions, type TimelineBridgeStatus } from './services/timelineBridge'
import { useStudioStore } from './stores/studioStore'

const panels = [
  { id: 'script', label: 'Script', icon: Sparkles },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'generate', label: 'Generate', icon: WandSparkles },
  { id: 'color', label: 'Color', icon: ImagePlus },
  { id: 'audio', label: 'Audio', icon: AudioLines },
  { id: 'export', label: 'Export', icon: Download },
] as const

const styleRows: Array<StylePackImage['row']> = [
  'environment',
  'lighting',
  'details',
]

function App() {
  const {
    activePanel,
    addAssetToTimeline,
    creditBalance,
    creditTransactions,
    exportAsset,
    exportProject,
    generateMusic,
    generateScript,
    generateStyleImage,
    generateVideo,
    importAsset,
    jobs,
    lastError,
    project,
    redo,
    screenplayDraft,
    selectedAssetId,
    setActivePanel,
    setSelectedAsset,
    undo,
    undoStack,
    redoStack,
  } = useStudioStore()

  const [scriptIdea, setScriptIdea] = useState('A courier finds a glowing film reel under a rain-soaked cinema.')
  const [genre, setGenre] = useState('Noir')
  const [stylePrompt, setStylePrompt] = useState('rainy neon cinema district with reflective asphalt')
  const [styleRow, setStyleRow] = useState<StylePackImage['row']>('environment')
  const [videoPrompt, setVideoPrompt] = useState('Slow dolly toward the courier as the reel starts projecting memories into the rain.')
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('720p')
  const [cameraPreset, setCameraPreset] = useState('Tracking')
  const [musicMood, setMusicMood] = useState('tense electronic noir')
  const [bridgeStatus, setBridgeStatus] = useState<TimelineBridgeStatus>({
    registered: false,
    availableElements: [],
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedAsset = useMemo(
    () => project.mediaAssets.find((asset) => asset.id === selectedAssetId),
    [project.mediaAssets, selectedAssetId],
  )
  const totalRuntime = project.timelineClips.reduce(
    (total, clip) => Math.max(total, clip.startSeconds + clip.durationSeconds),
    0,
  )

  useEffect(() => {
    void registerOmniclipElements().then(setBridgeStatus)
  }, [])

  const onImportFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      await importAsset(file)
    }
  }

  const hasRunningJob = jobs.some((job) => job.status === 'queued' || job.status === 'running')

  return (
    <main className="min-h-full bg-[#08090d] text-neutral-100">
      <header className="border-b border-white/10 bg-[#0e1016]/95 px-4 py-3">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-cyan-400 text-black">
              <Clapperboard size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Cine Studio</p>
              <h1 className="truncate text-lg font-semibold">{project.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="icon-button"
              disabled={undoStack.length === 0}
              onClick={undo}
              title="Undo"
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="icon-button"
              disabled={redoStack.length === 0}
              onClick={redo}
              title="Redo"
            >
              <RotateCw size={16} />
            </button>
            <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              {creditBalance} credits
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 xl:grid-cols-[360px_minmax(0,1fr)_330px]">
        <aside className="studio-panel">
          <nav className="grid grid-cols-3 gap-2">
            {panels.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`tool-tab ${activePanel === id ? 'tool-tab-active' : ''}`}
                onClick={() => setActivePanel(id)}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <section className="mt-4">
            {activePanel === 'script' && (
              <div className="space-y-3">
                <SectionTitle title="AI Script Writer" detail={`${getCreditPrice('script-generation')} credits`} />
                <textarea
                  className="field min-h-28"
                  value={scriptIdea}
                  onChange={(event) => setScriptIdea(event.target.value)}
                />
                <select className="field" value={genre} onChange={(event) => setGenre(event.target.value)}>
                  {['Noir', 'Sci-Fi', 'Thriller', 'Documentary', 'Romance', 'Horror'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <button
                  className="primary-button"
                  disabled={hasRunningJob || creditBalance < getCreditPrice('script-generation')}
                  onClick={() => void generateScript(scriptIdea, genre)}
                >
                  <Sparkles size={16} />
                  Generate screenplay
                </button>
              </div>
            )}

            {activePanel === 'style' && (
              <div className="space-y-3">
                <SectionTitle title="Style Pack" detail={`${getCreditPrice('style-image')} credit / tile`} />
                <select
                  className="field"
                  value={styleRow}
                  onChange={(event) => setStyleRow(event.target.value as StylePackImage['row'])}
                >
                  {styleRows.map((row) => (
                    <option key={row} value={row}>
                      {row}
                    </option>
                  ))}
                </select>
                <textarea
                  className="field min-h-24"
                  value={stylePrompt}
                  onChange={(event) => setStylePrompt(event.target.value)}
                />
                <button
                  className="primary-button"
                  disabled={hasRunningJob || creditBalance < getCreditPrice('style-image')}
                  onClick={() => void generateStyleImage(styleRow, stylePrompt)}
                >
                  <ImagePlus size={16} />
                  Generate tile
                </button>
                <StyleGrid images={project.stylePack.images} />
              </div>
            )}

            {activePanel === 'generate' && (
              <div className="space-y-3">
                <SectionTitle title="AI Video Generation" detail={`${getCreditPrice(videoFeatureForResolution(resolution))} credits`} />
                <textarea
                  className="field min-h-28"
                  value={videoPrompt}
                  onChange={(event) => setVideoPrompt(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select className="field" value={cameraPreset} onChange={(event) => setCameraPreset(event.target.value)}>
                    {['Tracking', 'WS', 'MS', 'CU', 'OTS', 'LA', 'ECU', 'Pan'].map((preset) => (
                      <option key={preset}>{preset}</option>
                    ))}
                  </select>
                  <select className="field" value={resolution} onChange={(event) => setResolution(event.target.value as typeof resolution)}>
                    <option>720p</option>
                    <option>1080p</option>
                    <option>4K</option>
                  </select>
                </div>
                <button
                  className="primary-button"
                  disabled={hasRunningJob || creditBalance < getCreditPrice(videoFeatureForResolution(resolution))}
                  onClick={() =>
                    void generateVideo({
                      prompt: videoPrompt,
                      resolution,
                      cameraPreset,
                      sceneId: project.scenes[0]?.id,
                    })
                  }
                >
                  <Play size={16} />
                  Generate clip
                </button>
              </div>
            )}

            {activePanel === 'color' && <ColorPanel />}
            {activePanel === 'audio' && (
              <div className="space-y-3">
                <SectionTitle title="Audio Studio" detail={`${getCreditPrice('music-track')} credits`} />
                <input className="field" value={musicMood} onChange={(event) => setMusicMood(event.target.value)} />
                <button className="primary-button" disabled={hasRunningJob} onClick={() => void generateMusic(musicMood, 45)}>
                  <AudioLines size={16} />
                  Generate music bed
                </button>
              </div>
            )}
            {activePanel === 'export' && (
              <div className="space-y-3">
                <SectionTitle title="Browser Export" detail="Mock WebCodecs handoff" />
                <p className="muted-copy">
                  The MVP creates an export manifest now. The adapter boundary is ready for
                  WebCodecs encoding in the next pass.
                </p>
                <button className="primary-button" onClick={() => void exportProject()}>
                  <Download size={16} />
                  Export project
                </button>
                {exportAsset && (
                  <a className="secondary-button justify-center" href={exportAsset.url} download={`${exportAsset.name}.json`}>
                    Download manifest
                  </a>
                )}
              </div>
            )}
          </section>
        </aside>

        <section className="space-y-4">
          <div className="studio-panel min-h-[390px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle title="Omniclip Timeline Bridge" detail={bridgeStatus.registered ? 'registered' : 'local fallback active'} />
              <div className="text-xs text-neutral-400">
                Runtime {formatTimecode(totalRuntime)} / {project.timelineClips.length} clips
              </div>
            </div>

            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                {timelineActions.map((action) => (
                  <span key={action} className="rounded bg-white/5 px-2 py-1">
                    {action}
                  </span>
                ))}
              </div>
              {bridgeStatus.error && <p className="mt-3 text-xs text-amber-300">{bridgeStatus.error}</p>}
              {bridgeStatus.registered && (
                <p className="mt-3 text-xs text-cyan-200">
                  Omniclip custom elements available: {bridgeStatus.availableElements.join(', ')}
                </p>
              )}
            </div>

            <TimelinePreview assets={project.mediaAssets} clips={project.timelineClips} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="studio-panel">
              <SectionTitle title="Script Breakdown" detail={`${project.scenes.length} scenes`} />
              <pre className="script-draft">{screenplayDraft || 'Generate a script to create scene beats for the timeline.'}</pre>
            </div>
            <div className="studio-panel">
              <SectionTitle title="Generation Queue" detail={`${jobs.length} jobs`} />
              <div className="mt-3 space-y-2">
                {jobs.length === 0 && <p className="muted-copy">No generation jobs yet.</p>}
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">{job.label}</span>
                      <span className="capitalize text-neutral-400">{job.status}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${job.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="studio-panel">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle title="Media Bin" detail={`${project.mediaAssets.length} assets`} />
              <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="Import media">
                <Upload size={16} />
              </button>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(event) => void onImportFiles(event.target.files)}
              />
            </div>
            <div className="mt-3 space-y-2">
              {project.mediaAssets.length === 0 && <p className="muted-copy">Generated clips and imports land here.</p>}
              {project.mediaAssets.map((asset) => (
                <MediaRow
                  key={asset.id}
                  asset={asset}
                  selected={asset.id === selectedAssetId}
                  onAdd={() => addAssetToTimeline(asset.id)}
                  onSelect={() => setSelectedAsset(asset.id)}
                />
              ))}
            </div>
          </div>

          <div className="studio-panel">
            <SectionTitle title="Inspector" detail={selectedAsset?.kind ?? 'none'} />
            {selectedAsset ? (
              <div className="mt-3 space-y-3 text-sm text-neutral-300">
                {selectedAsset.thumbnailUrl && <img className="aspect-video w-full rounded-md object-cover" src={selectedAsset.thumbnailUrl} alt="" />}
                <div className="font-medium text-white">{selectedAsset.name}</div>
                <div>Duration: {formatTimecode(selectedAsset.durationSeconds ?? 0)}</div>
                <div>Source: {selectedAsset.source}</div>
                <button className="secondary-button" onClick={() => addAssetToTimeline(selectedAsset.id)}>
                  <Plus size={15} />
                  Add to timeline
                </button>
              </div>
            ) : (
              <p className="muted-copy mt-3">Select an asset to inspect metadata and add it to the timeline.</p>
            )}
          </div>

          <div className="studio-panel">
            <SectionTitle title="Credit Ledger" detail={`${creditTransactions.length} events`} />
            <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
              {creditTransactions.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex justify-between gap-3 rounded-md bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-neutral-300">{tx.description}</span>
                  <span className={tx.amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {lastError && <div className="rounded-md border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{lastError}</div>}
        </aside>
      </div>
    </main>
  )
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-neutral-500">{detail}</p>
    </div>
  )
}

function StyleGrid({ images }: { images: StylePackImage[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {styleRows.map((row) => {
        const image = images.find((item) => item.row === row)
        return (
          <div key={row} className="aspect-square overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
            {image ? (
              <img src={image.url} alt={image.prompt} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center px-2 text-center text-[11px] text-neutral-500">{row}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ColorPanel() {
  const controls = ['Exposure', 'Contrast', 'Saturation', 'Temperature', 'Film Grain']
  return (
    <div className="space-y-3">
      <SectionTitle title="Color Grading" detail="WebGL shader controls mocked" />
      {controls.map((control) => (
        <label key={control} className="block text-xs text-neutral-400">
          <span>{control}</span>
          <input className="mt-2 w-full accent-cyan-300" type="range" min="-100" max="100" defaultValue="0" />
        </label>
      ))}
    </div>
  )
}

function MediaRow({
  asset,
  onAdd,
  onSelect,
  selected,
}: {
  asset: MediaAsset
  onAdd: () => void
  onSelect: () => void
  selected: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border p-2 ${selected ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]'}`}
    >
      <button className="h-12 w-16 overflow-hidden rounded bg-black/40" onClick={onSelect}>
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Film className="mx-auto text-neutral-500" size={18} />
        )}
      </button>
      <button className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <div className="truncate text-sm font-medium">{asset.name}</div>
        <div className="text-xs text-neutral-500">{asset.kind} / {formatTimecode(asset.durationSeconds ?? 0)}</div>
      </button>
      <button className="icon-button" onClick={onAdd} title="Add to timeline">
        <Plus size={15} />
      </button>
    </div>
  )
}

function TimelinePreview({
  assets,
  clips,
}: {
  assets: MediaAsset[]
  clips: Array<{ id: string; assetId: string; track: 'video' | 'audio'; startSeconds: number; durationSeconds: number }>
}) {
  const duration = clips.reduce((latest, clip) => Math.max(latest, clip.startSeconds + clip.durationSeconds), 15)

  return (
    <div className="mt-4 space-y-3">
      {(['video', 'audio'] as const).map((track) => (
        <div key={track} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">{track}</div>
          <div className="relative h-20 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
            {clips.filter((clip) => clip.track === track).map((clip) => {
              const asset = assets.find((item) => item.id === clip.assetId)
              const left = `${(clip.startSeconds / duration) * 100}%`
              const width = `${Math.max(8, (clip.durationSeconds / duration) * 100)}%`
              return (
                <button
                  key={clip.id}
                  className="absolute top-3 h-14 rounded border border-cyan-300/40 bg-cyan-300/20 px-3 text-left text-xs text-cyan-50"
                  style={{ left, width }}
                  title={asset?.name}
                >
                  <span className="block truncate">{asset?.name ?? 'Clip'}</span>
                  <span className="text-cyan-100/60">{formatTimecode(clip.durationSeconds)}</span>
                </button>
              )
            })}
            {clips.filter((clip) => clip.track === track).length === 0 && (
              <div className="grid h-full place-items-center text-xs text-neutral-600">Drop or add {track} assets</div>
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {hasNativeSpinner()}
        Cine Studio timeline metadata stays independent while Omniclip elements are registered.
      </div>
    </div>
  )
}

function hasNativeSpinner() {
  return <LoaderCircle size={13} className="animate-spin text-cyan-300" />
}

export default App

import { create } from 'zustand'
import type {
  CreditTransaction,
  GenerationJob,
  MediaAsset,
  Project,
  Scene,
  StylePack,
  TimelineClip,
} from '../domain/types'
import { videoFeatureForResolution } from '../lib/creditPricing'
import { createId } from '../lib/ids'
import { LocalCreditService } from '../services/creditService'
import { BrowserExportProvider } from '../services/exportProvider'
import { MockGenerationProvider } from '../services/mockGenerationProvider'
import { BrowserStorageProvider } from '../services/storageProvider'

type Panel = 'script' | 'style' | 'generate' | 'color' | 'audio' | 'export'

interface StudioState {
  activePanel: Panel
  project: Project
  selectedAssetId?: string
  jobs: GenerationJob[]
  creditBalance: number
  creditTransactions: CreditTransaction[]
  screenplayDraft: string
  exportAsset?: MediaAsset
  lastError?: string
  undoStack: Project[]
  redoStack: Project[]
  setActivePanel: (panel: Panel) => void
  setSelectedAsset: (assetId?: string) => void
  generateScript: (idea: string, genre: string) => Promise<void>
  generateStyleImage: (row: 'environment' | 'lighting' | 'details', prompt: string) => Promise<void>
  generateVideo: (input: {
    prompt: string
    resolution: '720p' | '1080p' | '4K'
    cameraPreset: string
    sceneId?: string
  }) => Promise<void>
  generateMusic: (mood: string, durationSeconds: number) => Promise<void>
  addAssetToTimeline: (assetId: string) => void
  importAsset: (file: File) => Promise<void>
  exportProject: () => Promise<void>
  undo: () => void
  redo: () => void
}

const generationProvider = new MockGenerationProvider()
const creditService = new LocalCreditService()
const storageProvider = new BrowserStorageProvider()
const exportProvider = new BrowserExportProvider()

function createDefaultStylePack(): StylePack {
  return {
    id: createId('stylepack'),
    name: 'Neon Noir Starter',
    images: [],
  }
}

function createDefaultProject(): Project {
  return {
    id: createId('project'),
    name: 'Untitled Cine Studio Short',
    scenes: [],
    stylePack: createDefaultStylePack(),
    mediaAssets: [],
    timelineClips: [],
    updatedAt: new Date().toISOString(),
  }
}

function makeDraft(scenes: Scene[]) {
  if (scenes.length === 0) return ''

  return [
    'FADE IN:',
    ...scenes.flatMap((scene) => [
      '',
      scene.heading,
      scene.action,
      scene.dialogue ? `\n${scene.dialogue}` : '',
    ]),
    '',
    'FADE OUT.',
  ].join('\n')
}

function commitProject(project: Project): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  }
}

function makeJob(kind: GenerationJob['kind'], label: string, prompt: string, reservationId?: string): GenerationJob {
  return {
    id: createId('job'),
    kind,
    label,
    prompt,
    status: 'queued',
    progress: 0,
    creditReservationId: reservationId,
    startedAt: new Date().toISOString(),
  }
}

function refreshCredits() {
  return {
    creditBalance: creditService.getBalance(),
    creditTransactions: creditService.listTransactions(),
  }
}

function updateJob(jobs: GenerationJob[], jobId: string, patch: Partial<GenerationJob>) {
  return jobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job))
}

function pushUndo(project: Project, stack: Project[]) {
  return [project, ...stack].slice(0, 50)
}

export const useStudioStore = create<StudioState>((set, get) => ({
  activePanel: 'script',
  project: createDefaultProject(),
  jobs: [],
  creditBalance: creditService.getBalance(),
  creditTransactions: creditService.listTransactions(),
  screenplayDraft: '',
  undoStack: [],
  redoStack: [],
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),

  generateScript: async (idea, genre) => {
    const reservation = creditService.reserveCredits(
      'script-generation',
      `Script draft: ${idea}`,
    )
    const job = makeJob('script', 'AI Script Writer', idea, reservation.id)
    set((state) => ({
      jobs: [job, ...state.jobs],
      lastError: undefined,
      ...refreshCredits(),
    }))

    try {
      const scenes = await generationProvider.generateScript(
        { idea, genre },
        ({ progress, status }) =>
          set((state) => ({
            jobs: updateJob(state.jobs, job.id, { progress, status }),
          })),
      )
      creditService.commitCredits(reservation.id)
      set((state) => {
        const project = commitProject({ ...state.project, scenes })
        void storageProvider.saveProjectManifest(project)
        return {
          project,
          screenplayDraft: makeDraft(scenes),
          jobs: updateJob(state.jobs, job.id, {
            progress: 100,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }),
          undoStack: pushUndo(state.project, state.undoStack),
          redoStack: [],
          ...refreshCredits(),
        }
      })
    } catch (error) {
      creditService.refundCredits(reservation.id, 'Script generation failed')
      set((state) => ({
        jobs: updateJob(state.jobs, job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Script failed',
        }),
        lastError: error instanceof Error ? error.message : 'Script failed',
        ...refreshCredits(),
      }))
    }
  },

  generateStyleImage: async (row, prompt) => {
    const reservation = creditService.reserveCredits('style-image', `Style image: ${prompt}`)
    const job = makeJob('style-image', `${row} style tile`, prompt, reservation.id)
    set((state) => ({
      jobs: [job, ...state.jobs],
      lastError: undefined,
      ...refreshCredits(),
    }))

    try {
      const image = await generationProvider.generateStyleImage(
        { row, prompt },
        ({ progress, status }) =>
          set((state) => ({
            jobs: updateJob(state.jobs, job.id, { progress, status }),
          })),
      )
      creditService.commitCredits(reservation.id)
      set((state) => {
        const nextImages = [
          ...state.project.stylePack.images.filter((item) => item.row !== row),
          image,
        ]
        const project = commitProject({
          ...state.project,
          stylePack: { ...state.project.stylePack, images: nextImages },
        })
        void storageProvider.saveProjectManifest(project)
        return {
          project,
          jobs: updateJob(state.jobs, job.id, {
            progress: 100,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }),
          undoStack: pushUndo(state.project, state.undoStack),
          redoStack: [],
          ...refreshCredits(),
        }
      })
    } catch (error) {
      creditService.refundCredits(reservation.id, 'Style image generation failed')
      set((state) => ({
        jobs: updateJob(state.jobs, job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Style image failed',
        }),
        lastError: error instanceof Error ? error.message : 'Style image failed',
        ...refreshCredits(),
      }))
    }
  },

  generateVideo: async (input) => {
    const feature = videoFeatureForResolution(input.resolution)
    const reservation = creditService.reserveCredits(feature, `Video clip: ${input.prompt}`)
    const job = makeJob('video', `${input.resolution} video clip`, input.prompt, reservation.id)
    set((state) => ({
      jobs: [job, ...state.jobs],
      lastError: undefined,
      ...refreshCredits(),
    }))

    try {
      const asset = await generationProvider.generateVideoClip(
        { ...input, stylePack: get().project.stylePack },
        ({ progress, status }) =>
          set((state) => ({
            jobs: updateJob(state.jobs, job.id, { progress, status }),
          })),
      )
      creditService.commitCredits(reservation.id)
      set((state) => {
        const project = commitProject({
          ...state.project,
          mediaAssets: [asset, ...state.project.mediaAssets],
        })
        void storageProvider.saveProjectManifest(project)
        return {
          project,
          selectedAssetId: asset.id,
          jobs: updateJob(state.jobs, job.id, {
            progress: 100,
            status: 'completed',
            assetId: asset.id,
            completedAt: new Date().toISOString(),
          }),
          undoStack: pushUndo(state.project, state.undoStack),
          redoStack: [],
          ...refreshCredits(),
        }
      })
    } catch (error) {
      creditService.refundCredits(reservation.id, 'Video generation failed')
      set((state) => ({
        jobs: updateJob(state.jobs, job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Video failed',
        }),
        lastError: error instanceof Error ? error.message : 'Video failed',
        ...refreshCredits(),
      }))
    }
  },

  generateMusic: async (mood, durationSeconds) => {
    const reservation = creditService.reserveCredits('music-track', `Music track: ${mood}`)
    const job = makeJob('music', 'AI Music Bed', mood, reservation.id)
    set((state) => ({
      jobs: [job, ...state.jobs],
      lastError: undefined,
      ...refreshCredits(),
    }))

    try {
      const asset = await generationProvider.generateMusicTrack(
        { mood, durationSeconds },
        ({ progress, status }) =>
          set((state) => ({
            jobs: updateJob(state.jobs, job.id, { progress, status }),
          })),
      )
      creditService.commitCredits(reservation.id)
      set((state) => {
        const project = commitProject({
          ...state.project,
          mediaAssets: [asset, ...state.project.mediaAssets],
        })
        void storageProvider.saveProjectManifest(project)
        return {
          project,
          selectedAssetId: asset.id,
          jobs: updateJob(state.jobs, job.id, {
            progress: 100,
            status: 'completed',
            assetId: asset.id,
            completedAt: new Date().toISOString(),
          }),
          undoStack: pushUndo(state.project, state.undoStack),
          redoStack: [],
          ...refreshCredits(),
        }
      })
    } catch (error) {
      creditService.refundCredits(reservation.id, 'Music generation failed')
      set((state) => ({
        jobs: updateJob(state.jobs, job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Music failed',
        }),
        lastError: error instanceof Error ? error.message : 'Music failed',
        ...refreshCredits(),
      }))
    }
  },

  addAssetToTimeline: (assetId) =>
    set((state) => {
      const asset = state.project.mediaAssets.find((item) => item.id === assetId)
      if (!asset) return {}
      const startSeconds = state.project.timelineClips.reduce(
        (latest, clip) => Math.max(latest, clip.startSeconds + clip.durationSeconds),
        0,
      )
      const clip: TimelineClip = {
        id: createId('clip'),
        assetId,
        track: asset.kind === 'audio' ? 'audio' : 'video',
        startSeconds,
        durationSeconds: asset.durationSeconds ?? 5,
      }
      const project = commitProject({
        ...state.project,
        timelineClips: [...state.project.timelineClips, clip],
      })
      void storageProvider.saveProjectManifest(project)
      return {
        project,
        undoStack: pushUndo(state.project, state.undoStack),
        redoStack: [],
      }
    }),

  importAsset: async (file) => {
    const stored = await storageProvider.saveBlob(file, file.name)
    const kind = file.type.startsWith('audio')
      ? 'audio'
      : file.type.startsWith('image')
        ? 'image'
        : 'video'
    const asset: MediaAsset = {
      id: createId('asset'),
      kind,
      name: file.name,
      url: stored.url,
      mimeType: file.type,
      storageKey: stored.storageKey,
      createdAt: new Date().toISOString(),
      source: 'imported',
    }
    set((state) => {
      const project = commitProject({
        ...state.project,
        mediaAssets: [asset, ...state.project.mediaAssets],
      })
      void storageProvider.saveProjectManifest(project)
      return {
        project,
        selectedAssetId: asset.id,
        undoStack: pushUndo(state.project, state.undoStack),
        redoStack: [],
      }
    })
  },

  exportProject: async () => {
    const exportAsset = await exportProvider.exportProject(get().project)
    set({ exportAsset })
  },

  undo: () =>
    set((state) => {
      const [previous, ...rest] = state.undoStack
      if (!previous) return {}
      return {
        project: previous,
        undoStack: rest,
        redoStack: [state.project, ...state.redoStack],
      }
    }),

  redo: () =>
    set((state) => {
      const [next, ...rest] = state.redoStack
      if (!next) return {}
      return {
        project: next,
        redoStack: rest,
        undoStack: [state.project, ...state.undoStack],
      }
    }),
}))

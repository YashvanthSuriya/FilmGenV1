export type AssetKind = 'video' | 'audio' | 'image' | 'script'

export type GenerationKind = 'script' | 'style-image' | 'video' | 'music'

export type GenerationStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type CreditFeature =
  | 'script-generation'
  | 'style-image'
  | 'video-720p'
  | 'video-1080p'
  | 'video-4k'
  | 'music-track'
  | 'voiceover'

export type TransactionKind = 'reserve' | 'commit' | 'refund' | 'grant'

export interface Scene {
  id: string
  heading: string
  action: string
  dialogue: string
  durationSeconds: number
}

export interface StylePackImage {
  id: string
  row: 'environment' | 'lighting' | 'details'
  prompt: string
  url: string
  storageKey?: string
}

export interface StylePack {
  id: string
  name: string
  images: StylePackImage[]
}

export interface MediaAsset {
  id: string
  kind: AssetKind
  name: string
  url: string
  mimeType: string
  durationSeconds?: number
  thumbnailUrl?: string
  storageKey?: string
  createdAt: string
  source: 'generated' | 'imported'
  prompt?: string
}

export interface TimelineClip {
  id: string
  assetId: string
  track: 'video' | 'audio'
  startSeconds: number
  durationSeconds: number
}

export interface Project {
  id: string
  name: string
  scenes: Scene[]
  stylePack: StylePack
  mediaAssets: MediaAsset[]
  timelineClips: TimelineClip[]
  updatedAt: string
}

export interface GenerationJob {
  id: string
  kind: GenerationKind
  label: string
  prompt: string
  status: GenerationStatus
  progress: number
  creditReservationId?: string
  error?: string
  assetId?: string
  startedAt: string
  completedAt?: string
}

export interface CreditTransaction {
  id: string
  kind: TransactionKind
  feature: CreditFeature
  amount: number
  description: string
  createdAt: string
  reservationId?: string
}

export interface GenerateScriptInput {
  idea: string
  genre: string
}

export interface GenerateStyleImageInput {
  row: StylePackImage['row']
  prompt: string
}

export interface GenerateVideoClipInput {
  prompt: string
  sceneId?: string
  resolution: '720p' | '1080p' | '4K'
  cameraPreset: string
  stylePack: StylePack
}

export interface GenerateMusicInput {
  mood: string
  durationSeconds: number
}

export interface GenerationProgress {
  jobId: string
  progress: number
  status: GenerationStatus
}

export interface GenerationProvider {
  generateScript(
    input: GenerateScriptInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<Scene[]>
  generateStyleImage(
    input: GenerateStyleImageInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<StylePackImage>
  generateVideoClip(
    input: GenerateVideoClipInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<MediaAsset>
  generateMusicTrack(
    input: GenerateMusicInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<MediaAsset>
  cancelJob(jobId: string): void
}

export interface CreditService {
  canAfford(feature: CreditFeature): boolean
  reserveCredits(feature: CreditFeature, description: string): CreditTransaction
  commitCredits(reservationId: string): CreditTransaction | undefined
  refundCredits(reservationId: string, description: string): CreditTransaction
  listTransactions(): CreditTransaction[]
}

export interface StorageProvider {
  saveBlob(blob: Blob, name: string): Promise<{ storageKey: string; url: string }>
  readBlob(storageKey: string): Promise<Blob | undefined>
  deleteAsset(storageKey: string): Promise<void>
  saveProjectManifest(project: Project): Promise<void>
  loadProjectManifest(projectId: string): Promise<Project | undefined>
}

export interface ExportProvider {
  exportProject(project: Project): Promise<MediaAsset>
}

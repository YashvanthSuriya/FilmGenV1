import type { Edge, Node } from "@xyflow/react"

export type Plan = "basic" | "pro" | "director"
export type GenerationStatus = "queued" | "processing" | "completed" | "failed" | "cancelled"
export type MediaType = "image" | "video" | "audio"

export interface ProjectStub {
  _id: string
  ownerId: string
  title: string
  description?: string
  status: "draft" | "active" | "archived"
  aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9"
  createdAt: number
  updatedAt: number
}

export interface GenerationJobStub {
  _id: string
  userId: string
  status: GenerationStatus
  type: "image" | "video" | "script" | "music" | "voiceover" | "storyboard" | "actor-sheet"
  prompt: string
  model: string
  creditsUsed: number
  resultMediaId?: string
  errorMessage?: string
  createdAt: number
}

export const studioTabs = ["storyboard", "workspace", "editing", "gallery", "challenges"] as const

export type StudioTab = (typeof studioTabs)[number]
export type WorkspaceNodeType =
  | "styleCard"
  | "actionCard"
  | "character"
  | "prompt"
  | "cameraConfig"
  | "imageOutput"
  | "videoOutput"
  | "combiner"
  | "script"
  | "preview"
export type WorkspaceRunStatus = "idle" | "queued" | "generating" | "completed" | "error"
export type TimelineTrackType = "video" | "audio" | "overlay"
export type TimelineClipType = "video" | "image" | "audio" | "overlay"
export type TimelinePlaybackStatus = "idle" | "playing" | "paused"
export type TimelineTransitionType = "cut" | "dissolve" | "wipe" | "dipToBlack" | "fadeInOut"
export type ProjectAssetSource = "storyboard" | "workspace"
export type ProjectAssetType = "image" | "video" | "audio"
export type ColorWheelKey = "lift" | "gamma" | "gain"
export type CurveChannel = "master" | "red" | "green" | "blue"
export type FilmLutName = "Natural" | "Noir" | "Teal/Orange" | "Bleach Bypass" | "Faded Film" | "High Contrast" | "Soft Glow" | "Cyberpunk" | "Vintage"
export type ColorScopeType = "waveform" | "vectorscope" | "histogram"
export type ColorPreviewMode = "after" | "before" | "split"
export type AudioGenre = "Cinematic" | "Electronic" | "Jazz" | "Acoustic" | "Ambient" | "Dramatic" | "Noir"
export type AudioIntensity = "Calm" | "Moderate" | "Intense"
export type SfxCategory = "Ambient" | "Foley" | "Music" | "Transitions" | "Nature" | "UI" | "Weather" | "Urban" | "Interior" | "Sci-Fi"
export type TextOverlayAnimation = "None" | "Fade" | "Slide In" | "Typewriter" | "Glow"
export type WorkspaceMode = "director"
export type ProjectSyncStatus = "local" | "queued" | "synced" | "error"
export type EditorToolWindow = "inspector" | "color" | "audio" | null

export interface StyleCard {
  id: string
  name: string
  description: string
  referenceImages: string[]
  generatedImages: string[]
  keywords: string[]
  mood: string
  palette: string[]
  primaryReference?: string
}

export interface Character {
  id: string
  name: string
  role: string
  description: string
  emotions: string[]
  portraitUrls: string[]
  styleCardIds: string[]
}

export interface ActionCard {
  id: string
  title: string
  beat: string
  subject: string
  action: string
  emotion: string
}

export type TemplateCategory = "Cinematic" | "Character" | "Concept" | "Environment"
export type GenerationMode = "image" | "video"
export type GenerationCardType = "style" | "storyboard" | "character" | "none"
export type GenerationLibraryType = Exclude<GenerationCardType, "none">
export type GenerationAspectRatio = "1:1" | "16:9" | "9:16" | "21:9"
export type ImageGenerationModel = "nanobanana-2" | "gpt-image-2"
export type VideoGenerationModel = "seedance-2" | "seedance-2-pro"
export type VideoGenerationSize = "480p" | "720p" | "1080p"
export type VideoDurationSeconds = 5 | 10 | 15

export interface Template {
  id: string
  name: string
  description: string
  guidanceSummary: string
  category: TemplateCategory
  cardType: GenerationLibraryType
  preview: string
  imageUrl: string
  examples: string[]
}

export interface GenerationReferenceImage {
  id: string
  name: string
  src: string
  size: number
  type: string
}

export interface GenerationAppliedCard {
  id: string
  type: GenerationLibraryType
  name: string
}

export interface GenerationResult {
  id: string
  projectId: string
  mediaType: GenerationMode
  prompt: string
  templateId?: string
  templateName?: string
  cardType: GenerationCardType
  referenceImages: GenerationReferenceImage[]
  aspectRatio: GenerationAspectRatio
  model: ImageGenerationModel | VideoGenerationModel
  videoSize?: VideoGenerationSize
  durationSeconds?: VideoDurationSeconds
  appliedCards?: GenerationAppliedCard[]
  creditCost: number
  imageUrl: string
  videoUrl?: string
  favorite?: boolean
  createdAt: string
}

export interface UserCardImage {
  id: string
  generationId: string
  imageUrl: string
  prompt: string
  createdAt: string
}

export interface UserCard {
  id: string
  projectId: string
  type: GenerationLibraryType
  name: string
  description: string
  images: UserCardImage[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceNodeData extends Record<string, unknown> {
  label?: string
  styleCardId?: string
  actionCardId?: string
  characterId?: string
  prompt?: string
  script?: string
  camera?: CameraConfig
  status?: WorkspaceRunStatus
  pinned?: boolean
  output?: string
  previewUrl?: string
  compiledPrompt?: string
  lastRunAt?: string
  assetId?: string
  errorMessage?: string
  storyboardFrameId?: string
  sourcePrompt?: string
  aspectRatio?: "16:9" | "9:16"
  referenceImages?: string[]
}

export interface WorkspaceEdgeData extends Record<string, unknown> {
  status?: WorkspaceRunStatus
}

export type WorkspaceNode = Node<WorkspaceNodeData, WorkspaceNodeType>
export type WorkspaceEdge = Edge<WorkspaceEdgeData>

export interface WorkspaceProjectSlot {
  id: string
  name: string
  mode?: WorkspaceMode
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  viewport: { x: number; y: number; zoom: number }
  lastAutosavedAt: string | null
}

export interface ProjectAsset {
  id: string
  source: ProjectAssetSource
  type: ProjectAssetType
  name: string
  prompt?: string
  thumbnailUrl?: string
  url?: string
  blobKey?: string
  mimeType?: string
  fileSize?: number
  duration?: number
  createdAt: string
  storyboardFrameId?: string
  workspaceNodeId?: string
}

export interface ProjectSlot {
  id: string
  name: string
  ownerId?: string
  projectId: string
  updatedAt: string
  version: number
  syncStatus: ProjectSyncStatus
  styleCards: StyleCard[]
  characters: Character[]
  actionCards: ActionCard[]
  assets: ProjectAsset[]
  cameraConfig: CameraConfig
  editingState: EditingState
  workspaceMode: WorkspaceMode
  workspaceMemory: {
    activeWorkspaceId: string
    workspaces: WorkspaceProjectSlot[]
    nodes: WorkspaceNode[]
    edges: WorkspaceEdge[]
    viewport: { x: number; y: number; zoom: number }
  }
}

export interface TimelineTrack {
  id: string
  type: TimelineTrackType
  name: string
  muted: boolean
  solo: boolean
  locked: boolean
  expanded: boolean
  order: number
}

export interface TimelineClip {
  id: string
  trackId: string
  mediaId?: string
  assetId?: string
  source?: ProjectAssetSource
  type: TimelineClipType
  name: string
  start: number
  duration: number
  inPoint: number
  outPoint: number
  color?: string
  url?: string
  thumbnailUrl?: string
  speed: number
  opacity: number
  volume: number
  pan: number
  fadeIn: number
  fadeOut: number
  position: { x: number; y: number }
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
  fit: "contain" | "cover"
  blendMode: "normal" | "screen" | "multiply" | "overlay"
}

export interface TimelineTransition {
  id: string
  type: TimelineTransitionType
  fromClipId: string
  toClipId: string
  duration: number
}

export interface ColorWheelValue {
  hue: number
  saturation: number
  luminance: number
}

export interface CurvePoint {
  id: string
  x: number
  y: number
}

export interface ColorManualControls {
  exposure: number
  contrast: number
  highlights: number
  shadows: number
  saturation: number
  temperature: number
  tint: number
  filmGrain: number
  vignette: number
}

export interface ColorGradingState {
  lift: ColorWheelValue
  gamma: ColorWheelValue
  gain: ColorWheelValue
  curves: Record<CurveChannel, CurvePoint[]>
  lut: {
    name: FilmLutName
    intensity: number
  }
  manual: ColorManualControls
  activeScope: ColorScopeType
  previewMode: ColorPreviewMode
}

export interface GeneratedMusicTrack {
  id: string
  prompt: string
  duration: number
  genre: AudioGenre
  intensity: AudioIntensity
  createdAt: string
}

export interface SfxItem {
  id: string
  name: string
  category: SfxCategory
  duration: number
}

export interface VoiceoverItem {
  id: string
  script: string
  voice: string
  duration: number
  speed: number
  pitch: number
  createdAt: string
}

export interface AudioMixerState {
  volumeAutomation: number
  pan: number
  eqLow: number
  eqMid: number
  eqHigh: number
  reverb: number
  compression: number
  ducking: number
}

export interface AudioStudioState {
  musicTracks: GeneratedMusicTrack[]
  sfx: SfxItem[]
  voiceovers: VoiceoverItem[]
  mixer: AudioMixerState
}

export interface TextOverlayClip {
  clipId: string
  text: string
  fontFamily: "Syne" | "DM Sans" | "Custom"
  customFont: string
  size: number
  color: string
  opacity: number
  alignment: "left" | "center" | "right"
  animation: TextOverlayAnimation
  animationDuration: number
  safeAreaSnapping: boolean
}

export interface TextOverlayState {
  clips: TextOverlayClip[]
}

export interface EditingState {
  tracks: TimelineTrack[]
  clips: TimelineClip[]
  transitions: TimelineTransition[]
  playheadPosition: number
  playbackState: TimelinePlaybackStatus
  selectedClipId: string | null
  timelineZoom: number
  playbackSpeed: number
  muted: boolean
  previewVolume: number
  selectedToolWindow: EditorToolWindow
  volume: number
  colorGrading: ColorGradingState
  audioState: AudioStudioState
  textOverlays: TextOverlayState
}

export interface CameraConfig {
  lens: string
  movement: string
  angle: string
  aperture: string
  fps: number
}

export interface NotificationItem {
  id: string
  title: string
  read: boolean
  createdAt: string
}

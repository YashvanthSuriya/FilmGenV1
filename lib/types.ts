import type { Edge, Node } from "@xyflow/react"

export const studioTabs = ["storyboard", "workspace", "editing", "export"] as const

export type StudioTab = (typeof studioTabs)[number]
export type PlanTier = "free" | "creator" | "filmmaker" | "director"
export type CreditEventType = "spend" | "purchase" | "refund" | "reset"
export type WorkspaceNodeType =
  | "styleCard"
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
export type ProjectAssetSource = "storyboard" | "workspace" | "import"
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

export interface CreditTransaction {
  id: string
  type: CreditEventType
  amount: number
  description: string
  createdAt: string
}

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

export interface StoryboardFrame {
  id: string
  title: string
  prompt: string
  shotType: string
  cameraMovement: string
  aspectRatio: "16:9" | "9:16"
  referenceImages: string[]
  imageUrl?: string
}

export interface WorkspaceNodeData extends Record<string, unknown> {
  label?: string
  styleCardId?: string
  characterId?: string
  prompt?: string
  script?: string
  camera?: CameraConfig
  status?: WorkspaceRunStatus
  pinned?: boolean
  output?: string
  previewUrl?: string
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
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  viewport: { x: number; y: number; zoom: number }
  lastAutosavedAt: string | null
}

export interface GeneratedMedia {
  id: string
  type: "image" | "video" | "audio" | "script"
  url?: string
  prompt?: string
  creditsUsed: number
  createdAt: string
  assetId?: string
  source?: ProjectAssetSource
}

export interface ProjectAsset {
  id: string
  source: ProjectAssetSource
  type: ProjectAssetType
  name: string
  prompt?: string
  thumbnailUrl?: string
  url?: string
  duration?: number
  createdAt: string
  storyboardFrameId?: string
  workspaceNodeId?: string
  blobKey?: string
  mimeType?: string
  size?: number
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

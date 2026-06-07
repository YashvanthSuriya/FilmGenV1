import { create } from "zustand"
import type {
  ActionCard,
  AudioMixerState,
  CameraConfig,
  Character,
  ColorManualControls,
  ColorPreviewMode,
  ColorScopeType,
  ColorWheelKey,
  ColorWheelValue,
  CurveChannel,
  EditorToolWindow,
  FilmLutName,
  EditingState,
  ProjectAsset,
  ProjectAssetType,
  ProjectSlot,
  StoryboardFrame,
  StoryboardStitch,
  StudioTab,
  StyleCard,
  TextOverlayClip,
  TimelineClip,
  TimelineTransitionType
} from "@/lib/types"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { projectRepository } from "@/lib/stores/projectRepository"
import { applyTransition, removeTransition } from "@/lib/editor/transitions"
import {
  addClip,
  createDefaultTextOverlayClip,
  createInitialEditingState,
  createTimelineClip,
  deleteClip,
  duplicateClip,
  ensureEditingStateDefaults,
  moveClip,
  reorderTracks,
  resolveClipStart,
  splitClip,
  trimClip,
  updateClip
} from "@/lib/editor/timeline"
import { createClipFromAsset, defaultTrackForAsset } from "@/lib/media/assets"

export interface ProjectStore {
  activeProjectId: string
  projects: ProjectSlot[]
  projectId: string
  projectName: string
  activeTab: StudioTab
  styleCards: StyleCard[]
  characters: Character[]
  actionCards: ActionCard[]
  storyboardFrames: StoryboardFrame[]
  storyboardStitches: StoryboardStitch[]
  assets: ProjectAsset[]
  cameraConfig: CameraConfig
  editingState: EditingState
  workspaceMode: ProjectSlot["workspaceMode"]
  renamingProjectId: string | null
  renameDraft: string
  createProject: () => void
  selectProject: (projectId: string) => void
  switchProject: (projectId: string) => void
  beginRenameProject: (projectId: string) => void
  setProjectRenameDraft: (name: string) => void
  commitRenameProject: () => void
  cancelRenameProject: () => void
  renameProject: (projectId: string, name: string) => void
  deleteProject: (projectId: string) => void
  setActiveTab: (tab: StudioTab) => void
  setProjectName: (name: string) => void
  addStyleCard: (styleCard: StyleCard) => void
  addCharacter: (character: Character) => void
  addStoryboardFrames: (frames: StoryboardFrame[]) => void
  updateStoryboardFrame: (id: string, frame: Partial<StoryboardFrame>) => void
  duplicateStoryboardFrame: (id: string) => void
  deleteStoryboardFrame: (id: string) => void
  createStoryboardStitch: (input: { frameIds: string[]; title: string; feedback: string }) => StoryboardStitch | null
  updateStoryboardStitchFeedback: (stitchId: string, feedback: string) => void
  importAsset: (asset: ProjectAsset) => void
  addAssetToTimeline: (assetId: string, trackId?: string, start?: number) => void
  addMediaClipToTimeline: (media: GeneratedTimelineMedia, trackId?: string, start?: number) => void
  renameTrack: (trackId: string, name: string) => void
  toggleTrack: (trackId: string, key: "muted" | "solo" | "locked" | "expanded") => void
  reorderTimelineTracks: (activeId: string, overId: string) => void
  addTimelineClip: (clip: TimelineClip) => void
  updateTimelineClip: (clipId: string, patch: Partial<TimelineClip>) => void
  moveTimelineClip: (clipId: string, trackId: string, start: number) => void
  trimTimelineClip: (clipId: string, edge: "start" | "end", position: number) => void
  splitTimelineClip: (clipId: string, position: number) => void
  duplicateTimelineClip: (clipId: string) => void
  deleteTimelineClip: (clipId: string) => void
  selectTimelineClip: (clipId: string | null) => void
  setPlayheadPosition: (position: number) => void
  setPlaybackState: (playbackState: EditingState["playbackState"]) => void
  setPlaybackSpeed: (playbackSpeed: number) => void
  setPreviewMuted: (muted: boolean) => void
  setPreviewVolume: (previewVolume: number) => void
  setEditorToolWindow: (selectedToolWindow: EditorToolWindow) => void
  setTimelineVolume: (volume: number) => void
  setTimelineZoom: (timelineZoom: number) => void
  applyTimelineTransition: (fromClipId: string, toClipId: string, type: TimelineTransitionType) => void
  removeTimelineTransition: (transitionId: string) => void
  updateColorWheel: (wheel: ColorWheelKey, value: Partial<ColorWheelValue>) => void
  updateColorManualControls: (patch: Partial<ColorManualControls>) => void
  selectLut: (name: FilmLutName) => void
  setLutIntensity: (intensity: number) => void
  addCurvePoint: (channel: CurveChannel, point: { x: number; y: number }) => void
  updateCurvePoint: (channel: CurveChannel, pointId: string, point: { x: number; y: number }) => void
  removeCurvePoint: (channel: CurveChannel, pointId: string) => void
  setActiveScope: (scope: ColorScopeType) => void
  setColorPreviewMode: (mode: ColorPreviewMode) => void
  updateAudioMixer: (patch: Partial<AudioMixerState>) => void
  updateTextOverlay: (clipId: string, patch: Partial<TextOverlayClip>) => void
  setWorkspaceMode: (mode: ProjectSlot["workspaceMode"]) => void
}

export interface GeneratedTimelineMedia {
  id: string
  type: ProjectAssetType
  name: string
  duration?: number
  url?: string
  thumbnailUrl?: string
}

export const defaultCameraConfig: CameraConfig = {
  lens: "35mm",
  movement: "locked-off",
  angle: "eye-level",
  aperture: "f/2.8",
  fps: 24
}

const MAX_PROJECTS = projectRepository.maxProjects

const demoDate = "2026-05-23T12:00:00.000Z"

export const demoStyleCards: StyleCard[] = [
  {
    id: "style-neon-noir",
    name: "Neon Rain Noir",
    description: "Wet pavement, cyan signage, amber practicals, and high-contrast night exteriors.",
    referenceImages: [],
    generatedImages: [
      "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(15,15,18,0.96) 48%, rgba(255,184,0,0.2))"
    ],
    keywords: ["neon", "rain", "noir", "cyan", "amber", "contrast"],
    mood: "Tense / Reflective / Cinematic",
    palette: ["#00E5FF", "#FFB800", "#101014", "#5D6D7E", "#F0F0F0"]
  },
  {
    id: "style-solar-western",
    name: "Solar Western",
    description: "Dusty daylight, analog film texture, bleached skies, and warm hard shadows.",
    referenceImages: [],
    generatedImages: [
      "linear-gradient(135deg, rgba(255,184,0,0.28), rgba(208,92,38,0.18), rgba(22,26,32,0.9))"
    ],
    keywords: ["sun", "dust", "35mm", "wide", "amber", "texture"],
    mood: "Expansive / Gritty / Human",
    palette: ["#FFB800", "#D05C26", "#293241", "#E0FBFC", "#111111"]
  }
]

export const demoCharacters: Character[] = [
  {
    id: "character-mira",
    name: "Mira Vale",
    role: "Courier",
    description: "Silver cropped hair, black raincoat, alert eyes, and a guarded posture.",
    emotions: ["Neutral", "Focused", "Alarmed", "Resolved"],
    portraitUrls: [
      "linear-gradient(135deg, rgba(0,229,255,0.22), rgba(18,18,22,0.96), rgba(255,184,0,0.12))",
      "linear-gradient(135deg, rgba(155,89,255,0.18), rgba(18,18,22,0.96), rgba(0,229,255,0.18))"
    ],
    styleCardIds: ["style-neon-noir"]
  },
  {
    id: "character-orren",
    name: "Orren Pike",
    role: "Fixer",
    description: "Weathered coat, brass spectacles, quiet smile, and a pocket full of secrets.",
    emotions: ["Neutral", "Concerned", "Amused", "Severe"],
    portraitUrls: [
      "linear-gradient(135deg, rgba(255,184,0,0.22), rgba(28,24,19,0.95), rgba(0,229,255,0.1))"
    ],
    styleCardIds: ["style-neon-noir", "style-solar-western"]
  }
]

export const demoActionCards: ActionCard[] = [
  {
    id: "action-market-crossing",
    title: "Market Crossing",
    beat: "Mira crosses the flooded night market while surveillance closes in.",
    subject: "Mira Vale",
    action: "moves through the crowd while scanning for the signal",
    emotion: "alert, hunted, controlled"
  }
]

export const demoStoryboardFrames: StoryboardFrame[] = [
  {
    id: "shot-market-reveal",
    title: "Market Reveal",
    prompt: "A wide shot reveals Mira crossing a flooded night market while search drones rake light over the crowd.",
    shotType: "Wide",
    cameraMovement: "Dolly",
    aspectRatio: "16:9",
    referenceImages: [demoStyleCards[0].generatedImages[0]],
    imageUrl: "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(7,8,13,0.96) 46%, rgba(255,184,0,0.16))"
  },
  {
    id: "shot-close-listen",
    title: "Signal Close-Up",
    prompt: "Close on Mira as a hidden earpiece flickers blue and she realizes the message is coming from inside the market.",
    shotType: "Close-up",
    cameraMovement: "Static",
    aspectRatio: "16:9",
    referenceImages: [demoCharacters[0].portraitUrls[0]],
    imageUrl: "linear-gradient(135deg, rgba(155,89,255,0.2), rgba(3,5,10,0.96), rgba(0,229,255,0.2))"
  },
  {
    id: "shot-rooftop-choice",
    title: "Rooftop Choice",
    prompt: "A quiet rooftop beat where Mira looks over the glowing city and decides whether to run or expose the signal.",
    shotType: "Medium",
    cameraMovement: "Pan",
    aspectRatio: "16:9",
    referenceImages: [],
    imageUrl: "linear-gradient(135deg, rgba(255,184,0,0.18), rgba(9,11,18,0.94), rgba(0,229,255,0.18))"
  }
]

export const demoAssets: ProjectAsset[] = [
  {
    id: "asset-market-reveal",
    source: "storyboard",
    type: "image",
    name: "Market Reveal",
    prompt: demoStoryboardFrames[0].prompt,
    url: demoStoryboardFrames[0].imageUrl,
    thumbnailUrl: demoStoryboardFrames[0].imageUrl,
    duration: 5,
    createdAt: demoDate,
    storyboardFrameId: "shot-market-reveal"
  },
  {
    id: "asset-signal-closeup",
    source: "storyboard",
    type: "image",
    name: "Signal Close-Up",
    prompt: demoStoryboardFrames[1].prompt,
    url: demoStoryboardFrames[1].imageUrl,
    thumbnailUrl: demoStoryboardFrames[1].imageUrl,
    duration: 4,
    createdAt: demoDate,
    storyboardFrameId: "shot-close-listen"
  },
  {
    id: "asset-city-bed",
    source: "storyboard",
    type: "audio",
    name: "City Night Bed",
    prompt: "Static demo audio bed represented on the timeline.",
    duration: 9,
    createdAt: demoDate
  }
]

function createDemoEditingState(): EditingState {
  const state = createInitialEditingState()
  const market = createClipFromAsset(demoAssets[0], "track-video-v1", 0)
  const closeup = createClipFromAsset(demoAssets[1], "track-video-v1", 5.25)
  const ambience = createClipFromAsset(demoAssets[2], "track-audio-a1", 0)
  const title = createTimelineClip({
    id: "clip-title-demo",
    trackId: "track-overlay-o1",
    type: "overlay",
    name: "Opening Title",
    start: 0.5,
    duration: 3,
    color: "var(--accent-purple)"
  })

  return {
    ...state,
    clips: [market, closeup, ambience, title],
    selectedClipId: market.id,
    textOverlays: {
      clips: [
        {
          ...createDefaultTextOverlayClip(title.id, "A NIGHT IN NEON"),
          size: 48,
          animation: "Glow"
        }
      ]
    },
    audioState: {
      ...state.audioState,
      musicTracks: [
        {
          id: "music-demo-pulse",
          prompt: "Slow cinematic pulse with analog strings",
          duration: 32,
          genre: "Cinematic",
          intensity: "Moderate",
          createdAt: demoDate
        }
      ],
      sfx: [
        { id: "rain-window", name: "Rain on window", category: "Weather", duration: 8 },
        { id: "neon-hum", name: "Neon transformer hum", category: "Sci-Fi", duration: 6 }
      ],
      voiceovers: [
        {
          id: "voiceover-demo",
          script: "The city exhaled neon, and she finally heard the truth.",
          voice: "Ava - Warm Narrator",
          duration: 4,
          speed: 1,
          pitch: 0,
          createdAt: demoDate
        }
      ]
    }
  }
}

function createDefaultWorkspaceMemory(): ProjectSlot["workspaceMemory"] {
  return {
    activeWorkspaceId: "workspace-1",
    workspaces: [],
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 0.85 }
  }
}

function readWorkspaceMemory(): ProjectSlot["workspaceMemory"] {
  const workspace = useWorkspaceStore.getState()
  return {
    activeWorkspaceId: workspace.activeWorkspaceId,
    workspaces: workspace.workspaces,
    nodes: workspace.nodes,
    edges: workspace.edges,
    viewport: workspace.viewport
  }
}

function applyWorkspaceMemory(memory: ProjectSlot["workspaceMemory"], mode: ProjectSlot["workspaceMode"]) {
  const workspace = useWorkspaceStore.getState()
  const workspaces = memory.workspaces.length > 0 ? memory.workspaces : workspace.workspaces
  const activeWorkspace = workspaces.find((item) => item.id === memory.activeWorkspaceId) ?? workspaces[0]
  useWorkspaceStore.setState({
    workspaceMode: mode,
    activeWorkspaceId: activeWorkspace?.id ?? "workspace-1",
    workspaces,
    nodes: activeWorkspace?.nodes ?? memory.nodes,
    edges: activeWorkspace?.edges ?? memory.edges,
    viewport: activeWorkspace?.viewport ?? memory.viewport,
    selectedNode: null,
    inspectedNode: null,
    saved: true,
    lastAutosavedAt: activeWorkspace?.lastAutosavedAt ?? "Local memory"
  })
}

function normalizeProjectSlot(project: ProjectSlot, index = 0): ProjectSlot {
  const id = project.id ?? project.projectId ?? `local-project-${index + 1}`
  return {
    ...project,
    id,
    projectId: project.projectId ?? id,
    ownerId: project.ownerId,
    version: project.version ?? 1,
    syncStatus: project.syncStatus ?? "local",
    actionCards: project.actionCards ?? [],
    storyboardStitches: project.storyboardStitches ?? [],
    editingState: ensureEditingStateDefaults(project.editingState),
    workspaceMode: project.workspaceMode ?? "director",
    workspaceMemory: project.workspaceMemory ?? createDefaultWorkspaceMemory()
  }
}

function withProjectSyncUpdate(project: ProjectSlot, patch: Partial<ProjectSlot> = {}): ProjectSlot {
  return {
    ...project,
    ...patch,
    projectId: project.projectId ?? project.id,
    version: (project.version ?? 1) + 1,
    syncStatus: "local",
    updatedAt: new Date().toISOString()
  }
}

function buildProjectSlot(state: Pick<ProjectStore, "projectId" | "projectName" | "styleCards" | "characters" | "actionCards" | "storyboardFrames" | "storyboardStitches" | "assets" | "cameraConfig" | "editingState" | "workspaceMode">, previous?: ProjectSlot): ProjectSlot {
  const base = previous ?? {
    id: state.projectId,
    projectId: state.projectId,
    name: state.projectName,
    version: 0,
    syncStatus: "local" as const,
    updatedAt: new Date().toISOString()
  }
  return {
    ...base,
    id: state.projectId,
    projectId: base.projectId ?? state.projectId,
    name: state.projectName,
    updatedAt: new Date().toISOString(),
    version: (base.version ?? 0) + 1,
    syncStatus: "local",
    styleCards: state.styleCards,
    characters: state.characters,
    actionCards: state.actionCards,
    storyboardFrames: state.storyboardFrames,
    storyboardStitches: state.storyboardStitches,
    assets: state.assets,
    cameraConfig: state.cameraConfig,
    editingState: state.editingState,
    workspaceMode: state.workspaceMode,
    workspaceMemory: readWorkspaceMemory()
  }
}

function createEmptyProjectSlot(index: number): ProjectSlot {
  const id = `local-project-${Date.now()}-${index}`
  return {
    id,
    projectId: id,
    name: `Project ${index}`,
    updatedAt: new Date().toISOString(),
    version: 1,
    syncStatus: "local",
    styleCards: [],
    characters: [],
    actionCards: [],
    storyboardFrames: [],
    storyboardStitches: [],
    assets: [],
    cameraConfig: defaultCameraConfig,
    editingState: createInitialEditingState(),
    workspaceMode: "amateur",
    workspaceMemory: createDefaultWorkspaceMemory()
  }
}

function createDemoProjectSlot(): ProjectSlot {
  return {
    id: "demo-cine-studio",
    projectId: "demo-cine-studio",
    name: "Neon Signal Demo",
    updatedAt: demoDate,
    version: 1,
    syncStatus: "local",
    styleCards: demoStyleCards,
    characters: demoCharacters,
    actionCards: demoActionCards,
    storyboardFrames: demoStoryboardFrames,
    storyboardStitches: [],
    assets: demoAssets,
    cameraConfig: defaultCameraConfig,
    editingState: createDemoEditingState(),
    workspaceMode: "director",
    workspaceMemory: createDefaultWorkspaceMemory()
  }
}

function saveProjectSlots(projects: ProjectSlot[]) {
  projectRepository.saveProjects(projects.map((project, index) => normalizeProjectSlot(project, index)))
}

function loadProjectSlots() {
  const projects = projectRepository.loadProjects().map((project, index) => normalizeProjectSlot(project, index))
  return projects.length > 0 ? projects.slice(0, MAX_PROJECTS) : [createDemoProjectSlot()]
}

function stitchPromptPayload(frames: StoryboardFrame[], feedback: string) {
  return [
    "Provider adapter target: NanoBanana 2 compatible storyboard image generation.",
    "Create one polished storyboard contact sheet from the ordered shots below.",
    "Preserve shot order, continuity, character identity, camera intent, and aspect ratio notes.",
    feedback ? `User feedback: ${feedback}` : "User feedback: keep continuity and readable storyboard panels.",
    ...frames.map((frame, index) => `Panel ${index + 1}: ${frame.title}. ${frame.shotType}, ${frame.cameraMovement}, ${frame.aspectRatio}. ${frame.prompt}`)
  ].join("\n")
}

function createContactSheetDataUrl(frames: StoryboardFrame[]) {
  if (typeof document === "undefined") return "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,184,0,0.12))"
  const panelWidth = 320
  const panelHeight = 240
  const padding = 24
  const cols = Math.min(3, Math.max(1, frames.length))
  const rows = Math.max(1, Math.ceil(frames.length / cols))
  const canvas = document.createElement("canvas")
  canvas.width = padding + cols * (panelWidth + padding)
  canvas.height = padding + rows * (panelHeight + padding)
  const context = canvas.getContext("2d")
  if (!context) return ""
  context.fillStyle = "#08080d"
  context.fillRect(0, 0, canvas.width, canvas.height)
  frames.forEach((frame, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = padding + col * (panelWidth + padding)
    const y = padding + row * (panelHeight + padding)
    const gradient = context.createLinearGradient(x, y, x + panelWidth, y + panelHeight)
    gradient.addColorStop(0, "#00e5ff")
    gradient.addColorStop(0.45, "#11131c")
    gradient.addColorStop(1, "#ffb800")
    context.fillStyle = gradient
    context.fillRect(x, y, panelWidth, panelHeight)
    context.fillStyle = "rgba(0,0,0,0.68)"
    context.fillRect(x, y + panelHeight - 74, panelWidth, 74)
    context.fillStyle = "#f0f0f0"
    context.font = "bold 16px sans-serif"
    context.fillText(`SH-${String(index + 1).padStart(2, "0")} ${frame.title}`, x + 12, y + panelHeight - 46, panelWidth - 24)
    context.font = "12px sans-serif"
    context.fillStyle = "#b8b8c5"
    context.fillText(`${frame.shotType} / ${frame.cameraMovement}`, x + 12, y + panelHeight - 24, panelWidth - 24)
  })
  return canvas.toDataURL("image/png")
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function sortCurvePoints<T extends { x: number }>(points: T[]) {
  return [...points].sort((a, b) => a.x - b.x)
}

const initialProjects = loadProjectSlots()
const initialProject = initialProjects[0]

function selectProjectPatch(state: ProjectStore, projectId: string) {
  const target = state.projects.find((project) => project.id === projectId)
  if (!target || target.id === state.activeProjectId) return state
  const previous = state.projects.find((project) => project.id === state.activeProjectId)
  const savedCurrent = buildProjectSlot(state, previous)
  const projects = state.projects.map((project) => (project.id === state.activeProjectId ? savedCurrent : project))
  saveProjectSlots(projects)
  applyWorkspaceMemory(target.workspaceMemory, target.workspaceMode)
  return {
    activeProjectId: target.id,
    projects,
    projectId: target.id,
    projectName: target.name,
    styleCards: target.styleCards,
    characters: target.characters,
    actionCards: target.actionCards ?? [],
    storyboardFrames: target.storyboardFrames,
    storyboardStitches: target.storyboardStitches ?? [],
    assets: target.assets,
    cameraConfig: target.cameraConfig,
    editingState: ensureEditingStateDefaults(target.editingState),
    workspaceMode: target.workspaceMode,
    renamingProjectId: null,
    renameDraft: ""
  }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  activeProjectId: initialProject.id,
  projects: initialProjects,
  projectId: initialProject.id,
  projectName: initialProject.name,
  activeTab: "storyboard",
  styleCards: initialProject.styleCards,
  characters: initialProject.characters,
  actionCards: initialProject.actionCards ?? [],
  storyboardFrames: initialProject.storyboardFrames,
  storyboardStitches: initialProject.storyboardStitches ?? [],
  assets: initialProject.assets,
  cameraConfig: initialProject.cameraConfig,
  editingState: ensureEditingStateDefaults(initialProject.editingState),
  workspaceMode: initialProject.workspaceMode ?? "director",
  renamingProjectId: null,
  renameDraft: "",
  createProject: () =>
    set((state) => {
      if (state.projects.length >= MAX_PROJECTS) return state
      const previous = state.projects.find((project) => project.id === state.activeProjectId)
      const savedCurrent = buildProjectSlot(state, previous)
      const projects = state.projects.map((project) => (project.id === state.activeProjectId ? savedCurrent : project))
      const nextProject = createEmptyProjectSlot(projects.length + 1)
      const nextProjects = [...projects, nextProject]
      saveProjectSlots(nextProjects)
      applyWorkspaceMemory(nextProject.workspaceMemory, nextProject.workspaceMode)
      return {
        activeProjectId: nextProject.id,
        projects: nextProjects,
        projectId: nextProject.id,
        projectName: nextProject.name,
        styleCards: nextProject.styleCards,
        characters: nextProject.characters,
        actionCards: nextProject.actionCards,
        storyboardFrames: nextProject.storyboardFrames,
        storyboardStitches: nextProject.storyboardStitches,
        assets: nextProject.assets,
        cameraConfig: nextProject.cameraConfig,
        editingState: nextProject.editingState,
        workspaceMode: nextProject.workspaceMode,
        renamingProjectId: null,
        renameDraft: ""
      }
    }),
  selectProject: (projectId) => set((state) => selectProjectPatch(state, projectId)),
  switchProject: (projectId) => set((state) => selectProjectPatch(state, projectId)),
  beginRenameProject: (projectId) =>
    set((state) => {
      const project = state.projects.find((item) => item.id === projectId)
      if (!project) return state
      return { renamingProjectId: projectId, renameDraft: project.id === state.activeProjectId ? state.projectName : project.name }
    }),
  setProjectRenameDraft: (renameDraft) => set({ renameDraft }),
  commitRenameProject: () =>
    set((state) => {
      if (!state.renamingProjectId) return state
      const name = state.renameDraft.trim()
      if (!name) return { renamingProjectId: null, renameDraft: "" }
      const projects = state.projects.map((project) => (project.id === state.renamingProjectId ? withProjectSyncUpdate(project, { name }) : project))
      saveProjectSlots(projects)
      return {
        projects,
        projectName: state.activeProjectId === state.renamingProjectId ? name : state.projectName,
        renamingProjectId: null,
        renameDraft: ""
      }
    }),
  cancelRenameProject: () => set({ renamingProjectId: null, renameDraft: "" }),
  renameProject: (projectId, name) =>
    set((state) => {
      const projects = state.projects.map((project) => (project.id === projectId ? withProjectSyncUpdate(project, { name }) : project))
      saveProjectSlots(projects)
      return {
        projects,
        projectName: state.activeProjectId === projectId ? name : state.projectName
      }
    }),
  deleteProject: (projectId) =>
    set((state) => {
      if (state.projects.length <= 1) return state
      const projects = state.projects.filter((project) => project.id !== projectId)
      const nextProject = state.activeProjectId === projectId ? projects[0] : undefined
      saveProjectSlots(projects)
      if (!nextProject) return { projects }
      applyWorkspaceMemory(nextProject.workspaceMemory, nextProject.workspaceMode)
      return {
        activeProjectId: nextProject.id,
        projects,
        projectId: nextProject.id,
        projectName: nextProject.name,
        styleCards: nextProject.styleCards,
        characters: nextProject.characters,
        actionCards: nextProject.actionCards ?? [],
        storyboardFrames: nextProject.storyboardFrames,
        storyboardStitches: nextProject.storyboardStitches ?? [],
        assets: nextProject.assets,
        cameraConfig: nextProject.cameraConfig,
        editingState: ensureEditingStateDefaults(nextProject.editingState),
        workspaceMode: nextProject.workspaceMode,
        renamingProjectId: null,
        renameDraft: ""
      }
    }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setProjectName: (projectName) =>
    set((state) => {
      const projects = state.projects.map((project) => (project.id === state.activeProjectId ? withProjectSyncUpdate(project, { name: projectName }) : project))
      saveProjectSlots(projects)
      return { projectName, projects }
    }),
  addStyleCard: (styleCard) => set((state) => ({ styleCards: [styleCard, ...state.styleCards] })),
  addCharacter: (character) => set((state) => ({ characters: [character, ...state.characters] })),
  addStoryboardFrames: (frames) => set((state) => ({ storyboardFrames: [...state.storyboardFrames, ...frames] })),
  updateStoryboardFrame: (id, frame) =>
    set((state) => ({
      storyboardFrames: state.storyboardFrames.map((item) => (item.id === id ? { ...item, ...frame } : item))
    })),
  duplicateStoryboardFrame: (id) =>
    set((state) => {
      const source = state.storyboardFrames.find((frame) => frame.id === id)
      if (!source) return state
      const index = state.storyboardFrames.findIndex((frame) => frame.id === id)
      const duplicate: StoryboardFrame = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        title: `${source.title} Copy`
      }
      const next = [...state.storyboardFrames]
      next.splice(index + 1, 0, duplicate)
      return { storyboardFrames: next }
    }),
  deleteStoryboardFrame: (id) =>
    set((state) => ({ storyboardFrames: state.storyboardFrames.filter((frame) => frame.id !== id) })),
  createStoryboardStitch: (input) => {
    const state = get()
    const selectedFrames = state.storyboardFrames.filter((frame) => input.frameIds.includes(frame.id))
    if (selectedFrames.length === 0) return null
    const stitch: StoryboardStitch = {
      id: `stitch-${Date.now()}`,
      frameIds: selectedFrames.map((frame) => frame.id),
      title: input.title.trim() || "Storyboard Stitch",
      feedback: input.feedback,
      imageUrl: createContactSheetDataUrl(selectedFrames),
      promptPayload: stitchPromptPayload(selectedFrames, input.feedback),
      createdAt: new Date().toISOString()
    }
    const asset: ProjectAsset = {
      id: `asset-${stitch.id}`,
      source: "storyboard",
      type: "image",
      name: stitch.title,
      prompt: stitch.promptPayload,
      url: stitch.imageUrl,
      thumbnailUrl: stitch.imageUrl,
      duration: Math.max(3, selectedFrames.length * 2),
      createdAt: stitch.createdAt
    }
    set((current) => ({
      storyboardStitches: [stitch, ...current.storyboardStitches],
      assets: [asset, ...current.assets]
    }))
    return stitch
  },
  updateStoryboardStitchFeedback: (stitchId, feedback) =>
    set((state) => ({
      storyboardStitches: state.storyboardStitches.map((stitch) =>
        stitch.id === stitchId
          ? {
              ...stitch,
              feedback,
              promptPayload: stitchPromptPayload(
                state.storyboardFrames.filter((frame) => stitch.frameIds.includes(frame.id)),
                feedback
              )
            }
          : stitch
      )
    })),
  importAsset: (asset) =>
    set((state) => ({
      assets: [asset, ...state.assets.filter((item) => item.id !== asset.id)]
    })),
  addAssetToTimeline: (assetId, trackId, start) =>
    set((state) => {
      const asset = state.assets.find((item) => item.id === assetId)
      if (!asset) return state
      const track = trackId
        ? state.editingState.tracks.find((item) => item.id === trackId)
        : defaultTrackForAsset(asset, state.editingState.tracks)
      if (!track || track.locked) return state
      if (asset.type === "audio" && track.type !== "audio") return state
      if (asset.type !== "audio" && track.type !== "video") return state
      const trackClips = state.editingState.clips.filter((item) => item.trackId === track.id)
      const appendStart = trackClips.length > 0 ? Math.max(...trackClips.map((item) => item.start + item.duration)) : 0
      const draftClip = createClipFromAsset(asset, track.id, start === undefined ? appendStart : start)
      const clip = {
        ...draftClip,
        start: resolveClipStart(state.editingState.clips, draftClip.id, track.id, draftClip.start, draftClip.duration)
      }
      return {
        editingState: {
          ...state.editingState,
          clips: addClip(state.editingState.clips, clip),
          selectedClipId: clip.id
        }
      }
    }),
  addMediaClipToTimeline: (media, trackId, start) =>
    set((state) => {
      const compatibleType = media.type === "audio" ? "audio" : "video"
      const track = trackId
        ? state.editingState.tracks.find((item) => item.id === trackId)
        : state.editingState.tracks.find((item) => item.type === compatibleType && !item.locked) ?? state.editingState.tracks.find((item) => item.type === compatibleType)
      if (!track || track.locked || track.type !== compatibleType) return state
      const trackClips = state.editingState.clips.filter((item) => item.trackId === track.id)
      const appendStart = trackClips.length > 0 ? Math.max(...trackClips.map((item) => item.start + item.duration)) : 0
      const draftClip = createTimelineClip({
        id: `clip-${media.id}-${Date.now()}`,
        mediaId: media.id,
        trackId: track.id,
        type: media.type,
        name: media.name,
        duration: media.duration ?? (media.type === "image" ? 5 : 8),
        start: start === undefined ? appendStart : start,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl
      })
      const clip = {
        ...draftClip,
        start: resolveClipStart(state.editingState.clips, draftClip.id, track.id, draftClip.start, draftClip.duration)
      }
      return {
        editingState: {
          ...state.editingState,
          clips: addClip(state.editingState.clips, clip),
          selectedClipId: clip.id
        }
      }
    }),
  renameTrack: (trackId, name) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        tracks: state.editingState.tracks.map((track) => (track.id === trackId ? { ...track, name } : track))
      }
    })),
  toggleTrack: (trackId, key) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        tracks: state.editingState.tracks.map((track) => (track.id === trackId ? { ...track, [key]: !track[key] } : track))
      }
    })),
  reorderTimelineTracks: (activeId, overId) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        tracks: reorderTracks(state.editingState.tracks, activeId, overId)
      }
    })),
  addTimelineClip: (clip) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: addClip(state.editingState.clips, clip),
        selectedClipId: clip.id
      }
    })),
  updateTimelineClip: (clipId, patch) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: updateClip(state.editingState.clips, clipId, patch)
      }
    })),
  moveTimelineClip: (clipId, trackId, start) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: moveClip(state.editingState.clips, state.editingState.tracks, clipId, trackId, start)
      }
    })),
  trimTimelineClip: (clipId, edge, position) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: trimClip(state.editingState.clips, clipId, edge, position)
      }
    })),
  splitTimelineClip: (clipId, position) =>
    set((state) => {
      const clips = splitClip(state.editingState.clips, clipId, position)
      const selectedClipId = clips.find((clip) => clip.id !== clipId && Math.abs(clip.start - position) < 0.001)?.id ?? clipId
      return {
        editingState: {
          ...state.editingState,
          clips,
          selectedClipId
        }
      }
    }),
  duplicateTimelineClip: (clipId) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: duplicateClip(state.editingState.clips, clipId)
      }
    })),
  deleteTimelineClip: (clipId) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        clips: deleteClip(state.editingState.clips, clipId),
        transitions: state.editingState.transitions.filter((transition) => transition.fromClipId !== clipId && transition.toClipId !== clipId),
        selectedClipId: state.editingState.selectedClipId === clipId ? null : state.editingState.selectedClipId
      }
    })),
  selectTimelineClip: (selectedClipId) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        selectedClipId
      }
    })),
  setPlayheadPosition: (playheadPosition) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        playheadPosition: Math.max(0, playheadPosition)
      }
    })),
  setPlaybackState: (playbackState) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        playbackState
      }
    })),
  setPlaybackSpeed: (playbackSpeed) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        playbackSpeed
      }
    })),
  setPreviewMuted: (muted) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        muted
      }
    })),
  setPreviewVolume: (previewVolume) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        previewVolume: clamp(previewVolume, 0, 100)
      }
    })),
  setEditorToolWindow: (selectedToolWindow) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        selectedToolWindow
      }
    })),
  setTimelineVolume: (volume) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        volume: clamp(volume, 0, 100)
      }
    })),
  setTimelineZoom: (timelineZoom) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        timelineZoom: clamp(timelineZoom, 0.5, 3)
      }
    })),
  applyTimelineTransition: (fromClipId, toClipId, type) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        transitions: applyTransition(state.editingState.transitions, state.editingState.clips, fromClipId, toClipId, type)
      }
    })),
  removeTimelineTransition: (transitionId) =>
    set((state) => ({
      editingState: {
        ...state.editingState,
        transitions: removeTransition(state.editingState.transitions, transitionId)
      }
    })),
  updateColorWheel: (wheel, value) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            [wheel]: {
              ...editingState.colorGrading[wheel],
              ...value,
              hue: clamp(value.hue ?? editingState.colorGrading[wheel].hue, 0, 360),
              saturation: clamp(value.saturation ?? editingState.colorGrading[wheel].saturation, 0, 100),
              luminance: clamp(value.luminance ?? editingState.colorGrading[wheel].luminance, -100, 100)
            }
          }
        }
      }
    }),
  updateColorManualControls: (patch) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            manual: {
              ...editingState.colorGrading.manual,
              ...patch,
              exposure: clamp(patch.exposure ?? editingState.colorGrading.manual.exposure, -2, 2),
              contrast: clamp(patch.contrast ?? editingState.colorGrading.manual.contrast, -50, 50),
              highlights: clamp(patch.highlights ?? editingState.colorGrading.manual.highlights, -100, 100),
              shadows: clamp(patch.shadows ?? editingState.colorGrading.manual.shadows, -100, 100),
              saturation: clamp(patch.saturation ?? editingState.colorGrading.manual.saturation, -100, 100),
              temperature: clamp(patch.temperature ?? editingState.colorGrading.manual.temperature, 2000, 10000),
              tint: clamp(patch.tint ?? editingState.colorGrading.manual.tint, -50, 50),
              filmGrain: clamp(patch.filmGrain ?? editingState.colorGrading.manual.filmGrain, 0, 100),
              vignette: clamp(patch.vignette ?? editingState.colorGrading.manual.vignette, 0, 100)
            }
          }
        }
      }
    }),
  selectLut: (name) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            lut: { ...editingState.colorGrading.lut, name }
          }
        }
      }
    }),
  setLutIntensity: (intensity) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            lut: { ...editingState.colorGrading.lut, intensity: clamp(intensity, 0, 100) }
          }
        }
      }
    }),
  addCurvePoint: (channel, point) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      const curve = editingState.colorGrading.curves[channel]
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            curves: {
              ...editingState.colorGrading.curves,
              [channel]: sortCurvePoints([
                ...curve,
                {
                  id: `curve-${channel}-${Date.now()}-${curve.length}`,
                  x: clamp(point.x, 0, 1),
                  y: clamp(point.y, 0, 1)
                }
              ])
            }
          }
        }
      }
    }),
  updateCurvePoint: (channel, pointId, point) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            curves: {
              ...editingState.colorGrading.curves,
              [channel]: sortCurvePoints(
                editingState.colorGrading.curves[channel].map((item) =>
                  item.id === pointId ? { ...item, x: clamp(point.x, 0, 1), y: clamp(point.y, 0, 1) } : item
                )
              )
            }
          }
        }
      }
    }),
  removeCurvePoint: (channel, pointId) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      const curve = editingState.colorGrading.curves[channel]
      if (pointId === "point-0" || pointId === "point-1" || curve.length <= 2) return { editingState }
      return {
        editingState: {
          ...editingState,
          colorGrading: {
            ...editingState.colorGrading,
            curves: {
              ...editingState.colorGrading.curves,
              [channel]: curve.filter((point) => point.id !== pointId)
            }
          }
        }
      }
    }),
  setActiveScope: (activeScope) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return { editingState: { ...editingState, colorGrading: { ...editingState.colorGrading, activeScope } } }
    }),
  setColorPreviewMode: (previewMode) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return { editingState: { ...editingState, colorGrading: { ...editingState.colorGrading, previewMode } } }
    }),
  updateAudioMixer: (patch) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      return {
        editingState: {
          ...editingState,
          audioState: {
            ...editingState.audioState,
            mixer: {
              ...editingState.audioState.mixer,
              ...patch,
              volumeAutomation: clamp(patch.volumeAutomation ?? editingState.audioState.mixer.volumeAutomation, 0, 100),
              pan: clamp(patch.pan ?? editingState.audioState.mixer.pan, -100, 100),
              eqLow: clamp(patch.eqLow ?? editingState.audioState.mixer.eqLow, -12, 12),
              eqMid: clamp(patch.eqMid ?? editingState.audioState.mixer.eqMid, -12, 12),
              eqHigh: clamp(patch.eqHigh ?? editingState.audioState.mixer.eqHigh, -12, 12),
              reverb: clamp(patch.reverb ?? editingState.audioState.mixer.reverb, 0, 100),
              compression: clamp(patch.compression ?? editingState.audioState.mixer.compression, 0, 100),
              ducking: clamp(patch.ducking ?? editingState.audioState.mixer.ducking, 0, 100)
            }
          }
        }
      }
    }),
  updateTextOverlay: (clipId, patch) =>
    set((state) => {
      const editingState = ensureEditingStateDefaults(state.editingState)
      const existing = editingState.textOverlays.clips.find((item) => item.clipId === clipId)
      const overlay = {
        ...(existing ?? createDefaultTextOverlayClip(clipId)),
        ...patch,
        size: clamp(patch.size ?? existing?.size ?? 56, 8, 240),
        opacity: clamp(patch.opacity ?? existing?.opacity ?? 100, 0, 100),
        animationDuration: clamp(patch.animationDuration ?? existing?.animationDuration ?? 0.6, 0, 10)
      }
      return {
        editingState: {
          ...editingState,
          textOverlays: {
            clips: [overlay, ...editingState.textOverlays.clips.filter((item) => item.clipId !== clipId)]
          }
        }
      }
    }),
  setWorkspaceMode: (workspaceMode) =>
    set(() => {
      useWorkspaceStore.getState().setWorkspaceMode(workspaceMode)
      return { workspaceMode }
    })
}))

if (typeof window !== "undefined") {
  applyWorkspaceMemory(initialProject.workspaceMemory, initialProject.workspaceMode ?? "director")
  useProjectStore.subscribe((state) => {
    const previous = state.projects.find((project) => project.id === state.activeProjectId)
    const currentProject = buildProjectSlot(state, previous)
    const projects = state.projects.map((project) => (project.id === state.activeProjectId ? currentProject : project))
    saveProjectSlots(projects)
  })
  useWorkspaceStore.subscribe(() => {
    const state = useProjectStore.getState()
    const previous = state.projects.find((project) => project.id === state.activeProjectId)
    const currentProject = buildProjectSlot(state, previous)
    const projects = state.projects.map((project) => (project.id === state.activeProjectId ? currentProject : project))
    saveProjectSlots(projects)
  })
}

import { create } from "zustand"
import type {
  CameraConfig,
  Character,
  CreditTransaction,
  GeneratedMedia,
  PlanTier,
  StoryboardFrame,
  StudioTab,
  StyleCard,
  WorkspaceEdge,
  WorkspaceNode
} from "@/lib/types"

export interface ProjectStore {
  projectId: string
  projectName: string
  activeTab: StudioTab
  credits: number
  plan: PlanTier
  creditEvents: CreditTransaction[]
  styleCards: StyleCard[]
  characters: Character[]
  storyboardFrames: StoryboardFrame[]
  workspaceNodes: WorkspaceNode[]
  workspaceEdges: WorkspaceEdge[]
  generatedMedia: GeneratedMedia[]
  cameraConfig: CameraConfig
  setActiveTab: (tab: StudioTab) => void
  updateCredits: (amount: number) => void
  spendCredits: (amount: number, description: string) => boolean
  refundCredits: (amount: number, description: string) => void
  setProjectName: (name: string) => void
  addStyleCard: (styleCard: StyleCard) => void
  addCharacter: (character: Character) => void
  addStoryboardFrames: (frames: StoryboardFrame[]) => void
  updateStoryboardFrame: (id: string, frame: Partial<StoryboardFrame>) => void
  duplicateStoryboardFrame: (id: string) => void
  deleteStoryboardFrame: (id: string) => void
}

export const defaultCameraConfig: CameraConfig = {
  lens: "35mm",
  movement: "locked-off",
  angle: "eye-level",
  aperture: "f/2.8",
  fps: 24
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projectId: "local-phase-1",
  projectName: "Untitled Project",
  activeTab: "storyboard",
  credits: 50,
  plan: "free",
  creditEvents: [],
  styleCards: [],
  characters: [],
  storyboardFrames: [],
  workspaceNodes: [],
  workspaceEdges: [],
  generatedMedia: [],
  cameraConfig: defaultCameraConfig,
  setActiveTab: (activeTab) => set({ activeTab }),
  updateCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits + amount) })),
  spendCredits: (amount, description) => {
    let didSpend = false
    set((state) => {
      if (state.credits < amount) return state
      didSpend = true
      return {
        credits: state.credits - amount,
        creditEvents: [
          {
            id: `credit-${Date.now()}-${state.creditEvents.length}`,
            type: "spend",
            amount: -amount,
            description,
            createdAt: new Date().toISOString()
          },
          ...state.creditEvents
        ]
      }
    })
    return didSpend
  },
  refundCredits: (amount, description) =>
    set((state) => ({
      credits: state.credits + amount,
      creditEvents: [
        {
          id: `credit-${Date.now()}-${state.creditEvents.length}`,
          type: "refund",
          amount,
          description,
          createdAt: new Date().toISOString()
        },
        ...state.creditEvents
      ]
    })),
  setProjectName: (projectName) => set({ projectName }),
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
    set((state) => ({ storyboardFrames: state.storyboardFrames.filter((frame) => frame.id !== id) }))
}))

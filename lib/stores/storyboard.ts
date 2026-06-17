import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { getStoryboardTemplate } from "@/lib/storyboard/templates"
import { defaultCameraConfig, useProjectStore } from "@/lib/stores/project"
import { convertUserCardToProjectCard } from "@/lib/workspace/cardBridge"
import type {
  CameraConfig,
  GenerationAspectRatio,
  GenerationAppliedCard,
  GenerationCardType,
  GenerationMode,
  GenerationLibraryType,
  GenerationReferenceImage,
  GenerationResult,
  ImageGenerationModel,
  VideoDurationSeconds,
  VideoGenerationModel,
  VideoGenerationSize,
  UserCard,
  UserCardImage
} from "@/lib/types"

export { storyboardTemplates } from "@/lib/storyboard/templates"

export type StoryboardFilter = "all" | GenerationLibraryType

export interface StoryboardComposerState {
  mode: GenerationMode
  prompt: string
  cardType: GenerationCardType
  aspectRatio: GenerationAspectRatio
  model: ImageGenerationModel
  videoModel: VideoGenerationModel
  videoSize: VideoGenerationSize
  durationSeconds: VideoDurationSeconds
  referenceImages: GenerationReferenceImage[]
  appliedCardIds: string[]
  /** Camera framing applied to every generation; carries over to Workspace on Send to Workspace. */
  camera: CameraConfig
}

export interface StoryboardProjectState {
  selectedTemplateId: string | null
  composer: StoryboardComposerState
  generations: GenerationResult[]
  cards: Record<GenerationLibraryType, UserCard[]>
  filter: StoryboardFilter
}

export interface CreateGenerationInput {
  mediaType?: GenerationMode
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
}

export interface AddCardInput {
  type: GenerationLibraryType
  name: string
  description: string
  generationIds: string[]
  existingCardId?: string
}

interface PersistedStoryboardStore {
  projects: Record<string, StoryboardProjectState>
}

const MAX_GENERATIONS_PER_PROJECT = 36
const MAX_CARDS_PER_TYPE = 24
const MAX_IMAGES_PER_CARD = 12
const MAX_PERSISTED_IMAGE_URL_LENGTH = 4096

const defaultComposer: StoryboardComposerState = {
  mode: "image",
  prompt: "",
  cardType: "storyboard",
  aspectRatio: "16:9",
  model: "nanobanana-2",
  videoModel: "seedance-2",
  videoSize: "1080p",
  durationSeconds: 5,
  referenceImages: [],
  appliedCardIds: [],
  camera: { ...defaultCameraConfig }
}

function createDefaultProjectState(): StoryboardProjectState {
  return {
    selectedTemplateId: null,
    composer: defaultComposer,
    generations: [],
    cards: {
      style: [],
      storyboard: [],
      character: []
    },
    filter: "all"
  }
}

function updateProject(
  projects: Record<string, StoryboardProjectState>,
  projectId: string,
  updater: (project: StoryboardProjectState) => StoryboardProjectState
) {
  const current = projects[projectId] ?? createDefaultProjectState()
  return { ...projects, [projectId]: updater(current) }
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function createStoredPlaceholderImage(prompt: string, cardType: GenerationCardType | GenerationLibraryType) {
  return `filmgen-poster:${cardType}:${hashString(`${cardType}:${prompt}`)}`
}

function compactImageUrl(imageUrl: string, prompt: string, cardType: GenerationCardType | GenerationLibraryType) {
  if (
    !imageUrl ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("filmgen-poster:") ||
    imageUrl.length > MAX_PERSISTED_IMAGE_URL_LENGTH
  ) {
    return createStoredPlaceholderImage(prompt, cardType)
  }
  return imageUrl
}

function compactReferenceImage(image: GenerationReferenceImage): GenerationReferenceImage {
  return { ...image, src: "" }
}

function compactGeneration(generation: GenerationResult): GenerationResult {
  return {
    ...generation,
    mediaType: generation.mediaType ?? "image",
    appliedCards: generation.appliedCards ?? [],
    favorite: generation.favorite ?? false,
    imageUrl: compactImageUrl(generation.imageUrl, generation.prompt, generation.cardType),
    referenceImages: generation.referenceImages.map(compactReferenceImage)
  }
}

function compactCardImage(image: UserCardImage, type: GenerationLibraryType): UserCardImage {
  return {
    ...image,
    imageUrl: compactImageUrl(image.imageUrl, image.prompt, type)
  }
}

function compactCard(card: UserCard): UserCard {
  return {
    ...card,
    images: card.images.slice(0, MAX_IMAGES_PER_CARD).map((image) => compactCardImage(image, card.type))
  }
}

function compactProjectForStorage(project: StoryboardProjectState): StoryboardProjectState {
  return {
    ...project,
    composer: {
      ...defaultComposer,
      ...project.composer,
      referenceImages: [],
      appliedCardIds: project.composer.appliedCardIds ?? [],
      camera: project.composer.camera ?? { ...defaultCameraConfig }
    },
    generations: project.generations.slice(0, MAX_GENERATIONS_PER_PROJECT).map(compactGeneration),
    cards: {
      style: project.cards.style.slice(0, MAX_CARDS_PER_TYPE).map(compactCard),
      storyboard: project.cards.storyboard.slice(0, MAX_CARDS_PER_TYPE).map(compactCard),
      character: project.cards.character.slice(0, MAX_CARDS_PER_TYPE).map(compactCard)
    }
  }
}

function compactProjectsForStorage(projects: Record<string, StoryboardProjectState>) {
  return Object.fromEntries(Object.entries(projects).map(([projectId, project]) => [projectId, compactProjectForStorage(project)]))
}

function isPersistedStoryboardStore(value: unknown): value is PersistedStoryboardStore {
  if (!value || typeof value !== "object") return false
  const maybeStore = value as { projects?: unknown }
  return Boolean(maybeStore.projects && typeof maybeStore.projects === "object")
}

function isQuotaExceededError(error: unknown) {
  return typeof DOMException !== "undefined" && error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
}

function getStoryboardStateStorage(): StateStorage {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available during server rendering.")
  }

  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, value)
      } catch (error) {
        if (!isQuotaExceededError(error)) throw error
        window.localStorage.removeItem(name)
        try {
          window.localStorage.setItem(name, value)
        } catch (retryError) {
          if (!isQuotaExceededError(retryError)) throw retryError
        }
      }
    },
    removeItem: (name) => window.localStorage.removeItem(name)
  }
}

function toCardImages(generations: GenerationResult[]): UserCardImage[] {
  return generations.map((generation) => ({
    id: `card-image-${generation.id}`,
    generationId: generation.id,
    imageUrl: generation.imageUrl,
    prompt: generation.prompt,
    createdAt: generation.createdAt
  }))
}

export interface StoryboardStore {
  projects: Record<string, StoryboardProjectState>
  ensureProject: (projectId: string) => void
  setSelectedTemplate: (projectId: string, templateId: string | null) => void
  updateComposer: (projectId: string, patch: Partial<StoryboardComposerState>) => void
  setFilter: (projectId: string, filter: StoryboardFilter) => void
  addReferenceImage: (projectId: string, image: GenerationReferenceImage) => void
  removeReferenceImage: (projectId: string, imageId: string) => void
  createGeneration: (projectId: string, input: CreateGenerationInput) => GenerationResult
  deleteGeneration: (projectId: string, generationId: string) => void
  toggleGenerationFavorite: (projectId: string, generationId: string) => void
  addCardFromGenerations: (projectId: string, input: AddCardInput) => UserCard | null
  renameCard: (projectId: string, cardId: string, name: string, description: string) => void
  deleteCard: (projectId: string, cardId: string) => void
  removeImageFromCard: (projectId: string, cardId: string, imageId: string) => void
}

export const useStoryboardStore = create<StoryboardStore>()(
  persist<StoryboardStore, [], [], PersistedStoryboardStore>(
    (set, get) => ({
      projects: {},
      ensureProject: (projectId) =>
        set((state) => (state.projects[projectId] ? state : { projects: { ...state.projects, [projectId]: createDefaultProjectState() } })),
      setSelectedTemplate: (projectId, templateId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => {
            const template = getStoryboardTemplate(templateId)
            return {
              ...project,
              selectedTemplateId: templateId,
              composer: template ? { ...project.composer, cardType: template.cardType } : project.composer
            }
          })
        })),
      updateComposer: (projectId, patch) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            composer: { ...project.composer, ...patch }
          }))
        })),
      setFilter: (projectId, filter) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({ ...project, filter }))
        })),
      addReferenceImage: (projectId, image) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            composer: {
              ...project.composer,
              referenceImages: [...project.composer.referenceImages, image]
            }
          }))
        })),
      removeReferenceImage: (projectId, imageId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            composer: {
              ...project.composer,
              referenceImages: project.composer.referenceImages.filter((image) => image.id !== imageId)
            }
          }))
        })),
      createGeneration: (projectId, input) => {
        const generation: GenerationResult = {
          id: `generation-${Date.now()}`,
          projectId,
          ...input,
          mediaType: input.mediaType ?? "image",
          createdAt: new Date().toISOString()
        }
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            generations: [generation, ...project.generations].slice(0, MAX_GENERATIONS_PER_PROJECT),
            composer: { ...project.composer, prompt: "" }
          }))
        }))
        return generation
      },
      deleteGeneration: (projectId, generationId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            generations: project.generations.filter((generation) => generation.id !== generationId)
          }))
        })),
      toggleGenerationFavorite: (projectId, generationId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            generations: project.generations.map((generation) =>
              generation.id === generationId ? { ...generation, favorite: !generation.favorite } : generation
            )
          }))
        })),
      addCardFromGenerations: (projectId, input) => {
        const project = get().projects[projectId] ?? createDefaultProjectState()
        const generations = project.generations.filter((generation) => input.generationIds.includes(generation.id))
        if (generations.length === 0) return null
        const images = toCardImages(generations)
        const now = new Date().toISOString()
        const existing = input.existingCardId
          ? project.cards[input.type].find((card) => card.id === input.existingCardId)
          : undefined
        const card: UserCard = existing
          ? {
              ...existing,
              images: [...images, ...existing.images].slice(0, MAX_IMAGES_PER_CARD),
              updatedAt: now
            }
          : {
              id: `user-card-${Date.now()}`,
              projectId,
              type: input.type,
              name: input.name.trim() || "Untitled Card",
              description: input.description.trim(),
              images,
              createdAt: now,
              updatedAt: now
            }
        set((state) => ({
          projects: updateProject(state.projects, projectId, (current) => ({
            ...current,
            cards: {
              ...current.cards,
              [input.type]: existing
                ? current.cards[input.type].map((item) => (item.id === card.id ? card : item))
                : [card, ...current.cards[input.type]].slice(0, MAX_CARDS_PER_TYPE)
            }
          }))
        }))

        // BRIDGE: also push the converted card into the project store so it appears
        // in the Workspace node dropdowns (StyleCardNode, CharacterNode, ActionCardNode).
        // The project store is the single source of truth for the workspace.
        const converted = convertUserCardToProjectCard(card, input.type)
        if (converted) {
          const projectStore = useProjectStore.getState()
          if (input.type === "style" && converted) {
            // Replace if the ID already exists (re-save), otherwise prepend
            const existingStyle = projectStore.styleCards.find((s) => s.id === converted.id)
            const nextStyleCards = existingStyle
              ? projectStore.styleCards.map((s) => (s.id === converted.id ? converted : s))
              : [converted, ...projectStore.styleCards]
            useProjectStore.setState({ styleCards: nextStyleCards as never })
          } else if (input.type === "character" && converted) {
            const existingChar = projectStore.characters.find((c) => c.id === converted.id)
            const nextCharacters = existingChar
              ? projectStore.characters.map((c) => (c.id === converted.id ? converted : c))
              : [converted, ...projectStore.characters]
            useProjectStore.setState({ characters: nextCharacters as never })
          }
        }

        return card
      },
      renameCard: (projectId, cardId, name, description) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            cards: {
              style: project.cards.style.map((card) => (card.id === cardId ? { ...card, name, description, updatedAt: new Date().toISOString() } : card)),
              storyboard: project.cards.storyboard.map((card) => (card.id === cardId ? { ...card, name, description, updatedAt: new Date().toISOString() } : card)),
              character: project.cards.character.map((card) => (card.id === cardId ? { ...card, name, description, updatedAt: new Date().toISOString() } : card))
            }
          }))
        })),
      deleteCard: (projectId, cardId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            cards: {
              style: project.cards.style.filter((card) => card.id !== cardId),
              storyboard: project.cards.storyboard.filter((card) => card.id !== cardId),
              character: project.cards.character.filter((card) => card.id !== cardId)
            }
          }))
        })),
      removeImageFromCard: (projectId, cardId, imageId) =>
        set((state) => ({
          projects: updateProject(state.projects, projectId, (project) => ({
            ...project,
            cards: {
              style: project.cards.style.map((card) => (card.id === cardId ? { ...card, images: card.images.filter((image) => image.id !== imageId), updatedAt: new Date().toISOString() } : card)),
              storyboard: project.cards.storyboard.map((card) => (card.id === cardId ? { ...card, images: card.images.filter((image) => image.id !== imageId), updatedAt: new Date().toISOString() } : card)),
              character: project.cards.character.map((card) => (card.id === cardId ? { ...card, images: card.images.filter((image) => image.id !== imageId), updatedAt: new Date().toISOString() } : card))
            }
          }))
        }))
    }),
    {
      name: "filmgen-storyboard-v2",
      storage: createJSONStorage<PersistedStoryboardStore>(getStoryboardStateStorage),
      partialize: (state) => ({ projects: compactProjectsForStorage(state.projects) }),
      version: 2,
      migrate: (persistedState) =>
        isPersistedStoryboardStore(persistedState)
          ? { projects: compactProjectsForStorage(persistedState.projects) }
          : { projects: {} },
      merge: (persistedState, currentState) => ({
        ...currentState,
        projects: isPersistedStoryboardStore(persistedState)
          ? compactProjectsForStorage(persistedState.projects)
          : currentState.projects
      })
    }
  )
)

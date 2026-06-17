"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type ReactNode } from "react"
import {
  Ban,
  Camera,
  Check,
  Download,
  Film,
  FolderOpen,
  Grid3X3,
  ImagePlus,
  Layers3,
  Loader2,
  Lock,
  Maximize2,
  Palette,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Star,
  Trash2,
  UserRound,
  Volume2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoryboardContentSection, StoryboardWorkspaceLayout } from "@/components/cards/storyboard/storyboard-layout"
import { ElitePlanCard } from "@/components/cards/storyboard/elite-plan-card"
import { CardStack, type CardStackItem } from "@/components/ui/card-stack"
import { SendToWorkspaceButton } from "@/components/workspace/SendToWorkspaceButton"
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1"
import { CameraConfigGrid } from "@/components/workspace/nodes/CameraConfigGrid"
import { useProjectStore, defaultCameraConfig } from "@/lib/stores/project"
import {
  storyboardTemplates,
  useStoryboardStore,
  type AddCardInput
} from "@/lib/stores/storyboard"
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
  Template,
  UserCard,
  VideoDurationSeconds,
  VideoGenerationModel,
  VideoGenerationSize
} from "@/lib/types"

const MAX_REFERENCE_IMAGES = 14
const MAX_APPLIED_CARDS = 12
const MAX_REFERENCE_SIZE = 10 * 1024 * 1024
const MOCK_GENERATION_DELAY_MS = 8500
const MOCK_GENERATION_RESET_MS = 180
const ACCEPTED_REFERENCE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])
const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",")

const aspectRatios: GenerationAspectRatio[] = ["1:1", "16:9", "9:16", "21:9"]
const videoSizes: VideoGenerationSize[] = ["480p", "720p", "1080p"]
const videoDurations: VideoDurationSeconds[] = [5, 10, 15]
const generationModes: Array<{ value: GenerationMode; label: string; description: string; icon: typeof ImagePlus }> = [
  { value: "image", label: "Image", description: "Generate cards and still frames", icon: ImagePlus },
  { value: "video", label: "Video", description: "Generate motion clips from the same context", icon: Film }
]
const cardTypes: Array<{ value: GenerationCardType; label: string; icon: typeof Palette; shortLabel: string; promptPlaceholder: string }> = [
  {
    value: "style",
    label: "Style Card",
    shortLabel: "Style",
    icon: Palette,
    promptPlaceholder: "Describe visual language, mood, palette, lighting, and texture..."
  },
  {
    value: "storyboard",
    label: "Storyboard",
    shortLabel: "Story",
    icon: Film,
    promptPlaceholder: "Describe a scene, shot, action, mood, or moment..."
  },
  {
    value: "character",
    label: "Character Ref",
    shortLabel: "Character",
    icon: UserRound,
    promptPlaceholder: "Describe a character: appearance, wardrobe, expression, props..."
  },
  {
    value: "none",
    label: "None",
    shortLabel: "None",
    icon: Ban,
    promptPlaceholder: "Describe your scene, character, mood, or style..."
  }
]
const modelOptions: Array<{ value: ImageGenerationModel; label: string; description: string; disabled?: boolean }> = [
  { value: "nanobanana-2", label: "Nano Banana 2", description: "Fast mock image preview" },
  { value: "gpt-image-2", label: "GPT Image 2", description: "Premium model reserved", disabled: true }
]
const videoModelOptions: Array<{ value: VideoGenerationModel; label: string; description: string; disabled?: boolean }> = [
  { value: "seedance-2", label: "Seedance 2.0", description: "Storyboard-to-video mock preview" },
  { value: "seedance-2-pro", label: "Seedance 2.0 Pro", description: "Reserved for longer premium clips", disabled: true }
]
type GalleryMediaFilter = "all" | GenerationMode
type GalleryCardFilter = "all" | GenerationLibraryType
type GallerySort = "newest" | "oldest" | "favorites-first" | "images-first" | "videos-first"
type GalleryDensity = "comfort" | "compact"
type StoryboardSection = "create" | "media"
type ComposerSection = "templates" | "cards" | "references" | "camera" | "model" | "output"
type PendingGenerationPreview = {
  id: string
  mode: GenerationMode
  prompt: string
  cardType: GenerationCardType
  model: ImageGenerationModel | VideoGenerationModel
  imageUrl: string
  videoSize?: VideoGenerationSize
  durationSeconds?: VideoDurationSeconds
}
const mediaFilterOptions: Array<{ value: GalleryMediaFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" }
]
const cardFilterOptions: Array<{ value: GalleryCardFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "style", label: "Style Cards" },
  { value: "storyboard", label: "Storyboards" },
  { value: "character", label: "Characters" }
]
const gallerySortOptions: Array<{ value: GallerySort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "favorites-first", label: "Starred first" },
  { value: "images-first", label: "Images first" },
  { value: "videos-first", label: "Videos first" }
]
const templateTypeFilters: Array<{ value: GenerationLibraryType; label: string; icon: typeof Palette }> = [
  { value: "style", label: "Style", icon: Palette },
  { value: "storyboard", label: "Storyboard", icon: Film },
  { value: "character", label: "Character", icon: UserRound }
]
const libraryLabels: Record<GenerationLibraryType, string> = {
  style: "My Style Cards",
  storyboard: "My Storyboards",
  character: "My Character Ref Sheets"
}

const libraryShortLabels: Record<GenerationLibraryType, string> = {
  style: "Style",
  storyboard: "Storyboard",
  character: "Character"
}

function getAppliedCards(cards: Record<GenerationLibraryType, UserCard[]>, cardIds: string[]): GenerationAppliedCard[] {
  const byId = new Map<string, UserCard>()
  Object.values(cards).forEach((cardGroup) => {
    cardGroup.forEach((card) => byId.set(card.id, card))
  })

  return cardIds
    .map((id) => byId.get(id))
    .filter((card): card is UserCard => Boolean(card))
    .map((card) => ({ id: card.id, type: card.type, name: card.name }))
}

function cardTypeLabel(type: GenerationCardType) {
  return cardTypes.find((cardType) => cardType.value === type)?.label ?? "None"
}

function cardTypePromptPlaceholder(type: GenerationCardType, mode: GenerationMode) {
  if (mode === "video") return "Describe motion, action, camera move, and continuity..."
  return cardTypes.find((cardType) => cardType.value === type)?.promptPlaceholder ?? "Describe your scene, character, mood, or style..."
}

function cardTypeIcon(type: GenerationCardType) {
  return cardTypes.find((cardType) => cardType.value === type)?.icon ?? Ban
}

function mediaTypeLabel(mode: GenerationMode) {
  return mode === "video" ? "Video" : "Image"
}

function generationMediaType(generation: GenerationResult): GenerationMode {
  return generation.mediaType ?? "image"
}

function modelLabel(model: ImageGenerationModel | VideoGenerationModel) {
  if (model === "nanobanana-2") return "Nano Banana 2"
  if (model === "gpt-image-2") return "GPT Image 2"
  if (model === "seedance-2-pro") return "Seedance 2.0 Pro"
  return "Seedance 2.0"
}

function imageCreditCost(model: ImageGenerationModel) {
  return model === "gpt-image-2" ? 4 : 3
}

function videoCreditCost(model: VideoGenerationModel, videoSize: VideoGenerationSize, durationSeconds: VideoDurationSeconds) {
  const sizeCost = videoSize === "1080p" ? 10 : videoSize === "720p" ? 7 : 5
  const durationCost = durationSeconds === 15 ? 8 : durationSeconds === 10 ? 5 : 3
  const modelCost = model === "seedance-2-pro" ? 6 : 0
  return sizeCost + durationCost + modelCost
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function uuid(prefix: string) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${id}`
}

function getAspectSize(aspectRatio: GenerationAspectRatio) {
  if (aspectRatio === "1:1") return { width: 1200, height: 1200 }
  if (aspectRatio === "9:16") return { width: 1080, height: 1920 }
  if (aspectRatio === "21:9") return { width: 1680, height: 720 }
  return { width: 1600, height: 900 }
}

function getVideoSize(videoSize: VideoGenerationSize) {
  if (videoSize === "1080p") return { width: 1920, height: 1080 }
  if (videoSize === "720p") return { width: 1280, height: 720 }
  return { width: 854, height: 480 }
}

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function isDisplayableImageUrl(value?: string) {
  return Boolean(value && !value.startsWith("filmgen-poster:"))
}

function posterToken(input: {
  mode: GenerationMode
  prompt: string
  cardType: GenerationCardType
  model: ImageGenerationModel | VideoGenerationModel
}) {
  return `filmgen-poster:${input.mode}:${input.cardType}:${hashString(`${input.mode}:${input.cardType}:${input.model}:${input.prompt}`).toString(36)}`
}

type PosterMedia = {
  id?: string
  mediaType?: GenerationMode
  mode?: GenerationMode
  prompt: string
  templateName?: string
  cardType: GenerationCardType
  model: ImageGenerationModel | VideoGenerationModel
  imageUrl?: string
  aspectRatio?: GenerationAspectRatio
  videoSize?: VideoGenerationSize
  durationSeconds?: VideoDurationSeconds
}

const posterPalettes = [
  { a: "rgba(0,229,255,0.34)", b: "rgba(155,89,255,0.24)", c: "rgba(255,184,0,0.13)", d: "#031015" },
  { a: "rgba(155,89,255,0.32)", b: "rgba(0,255,148,0.18)", c: "rgba(0,229,255,0.16)", d: "#080713" },
  { a: "rgba(255,184,0,0.20)", b: "rgba(0,229,255,0.26)", c: "rgba(155,89,255,0.16)", d: "#100c05" },
  { a: "rgba(255,69,69,0.18)", b: "rgba(155,89,255,0.26)", c: "rgba(0,229,255,0.14)", d: "#10070d" },
  { a: "rgba(0,255,148,0.18)", b: "rgba(0,229,255,0.26)", c: "rgba(255,184,0,0.12)", d: "#04110d" }
]

function posterPalette(media: PosterMedia) {
  const seed = hashString(`${media.id ?? ""}:${media.prompt}:${media.cardType}:${media.model}`)
  return posterPalettes[seed % posterPalettes.length]
}

function mediaMode(media: PosterMedia): GenerationMode {
  return media.mediaType ?? media.mode ?? "image"
}

function posterBackground(media: PosterMedia) {
  const palette = posterPalette(media)
  const seed = hashString(`${media.prompt}:${media.model}`)
  const x1 = 14 + (seed % 28)
  const y1 = 12 + ((seed >> 3) % 22)
  const x2 = 60 + ((seed >> 5) % 26)
  const y2 = 20 + ((seed >> 7) % 44)
  return `radial-gradient(circle at ${x1}% ${y1}%, ${palette.a}, transparent 34%), radial-gradient(circle at ${x2}% ${y2}%, rgba(255,255,255,0.12), transparent 22%), radial-gradient(circle at 76% 78%, ${palette.b}, transparent 40%), radial-gradient(circle at 24% 86%, ${palette.c}, transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(3,5,6,0.86) 46%, ${palette.d} 100%)`
}

function downloadPosterDataUrl(generation: GenerationResult) {
  if (isDisplayableImageUrl(generation.imageUrl)) return generation.imageUrl
  const isVideo = generationMediaType(generation) === "video"
  const { width, height } = isVideo ? getVideoSize(generation.videoSize ?? "1080p") : getAspectSize(generation.aspectRatio)
  const palette = posterPalette(generation)
  const title = escapeSvgText(generation.templateName ?? (isVideo ? "Generated Video" : cardTypeLabel(generation.cardType)))
  const prompt = escapeSvgText(generation.prompt.trim().slice(0, 110) || "Untitled generation")
  const meta = escapeSvgText(isVideo ? `${modelLabel(generation.model)} / ${generation.videoSize ?? "1080p"} / ${generation.durationSeconds ?? 5}s` : `${modelLabel(generation.model)} / ${generation.aspectRatio}`)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#050708"/>
      <rect width="100%" height="100%" fill="${palette.c}"/>
      <circle cx="${Math.round(width * 0.2)}" cy="${Math.round(height * 0.18)}" r="${Math.round(Math.min(width, height) * 0.34)}" fill="${palette.a}" opacity="0.74"/>
      <circle cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.76)}" r="${Math.round(Math.min(width, height) * 0.38)}" fill="${palette.b}" opacity="0.8"/>
      <rect y="${Math.round(height * 0.62)}" width="${width}" height="${Math.round(height * 0.38)}" fill="rgba(0,0,0,0.68)"/>
      <text x="48" y="${Math.round(height * 0.72)}" fill="#00e5ff" font-family="Inter, Arial, sans-serif" font-size="${Math.max(16, Math.floor(width / 92))}" font-weight="800">${isVideo ? "GENERATED VIDEO" : "GENERATED IMAGE"}</text>
      <text x="48" y="${Math.round(height * 0.8)}" fill="#f6f7fb" font-family="Inter, Arial, sans-serif" font-size="${Math.max(32, Math.floor(width / 36))}" font-weight="800">${title}</text>
      <text x="48" y="${Math.round(height * 0.88)}" fill="#b8c0cc" font-family="Inter, Arial, sans-serif" font-size="${Math.max(20, Math.floor(width / 64))}">${prompt}</text>
      <text x="48" y="${height - 42}" fill="#00e5ff" font-family="Inter, Arial, sans-serif" font-size="${Math.max(16, Math.floor(width / 82))}" font-weight="700">${meta}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function createGenerationPoster(input: {
  mode: GenerationMode
  prompt: string
  template?: Template
  cardType?: GenerationCardType
  aspectRatio: GenerationAspectRatio
  model: ImageGenerationModel | VideoGenerationModel
  videoSize?: VideoGenerationSize
  durationSeconds?: VideoDurationSeconds
}) {
  const cardType = input.mode === "video" ? "none" : input.cardType ?? input.template?.cardType ?? "storyboard"
  return posterToken({ mode: input.mode, prompt: input.prompt, cardType, model: input.model })
}

async function readReferenceFile(file: File): Promise<GenerationReferenceImage> {
  if (!ACCEPTED_REFERENCE_TYPES.has(file.type)) throw new Error(`${file.name} must be a PNG, JPG, or WebP image.`)
  if (file.size > MAX_REFERENCE_SIZE) throw new Error(`${file.name} is larger than 10MB.`)
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error("Could not read reference image."))
    reader.readAsDataURL(file)
  })
  return { id: uuid("reference"), name: file.name, src, size: file.size, type: file.type }
}

export function StoryboardWorkspace() {
  const projectId = useProjectStore((state) => state.activeProjectId)
  const projectState = useStoryboardStore((state) => state.projects[projectId])
  const ensureProject = useStoryboardStore((state) => state.ensureProject)
  const setSelectedTemplate = useStoryboardStore((state) => state.setSelectedTemplate)
  const updateComposer = useStoryboardStore((state) => state.updateComposer)
  const addReferenceImage = useStoryboardStore((state) => state.addReferenceImage)
  const removeReferenceImage = useStoryboardStore((state) => state.removeReferenceImage)
  const createGeneration = useStoryboardStore((state) => state.createGeneration)
  const deleteGeneration = useStoryboardStore((state) => state.deleteGeneration)
  const toggleGenerationFavorite = useStoryboardStore((state) => state.toggleGenerationFavorite)
  const addCardFromGenerations = useStoryboardStore((state) => state.addCardFromGenerations)
  const renameCard = useStoryboardStore((state) => state.renameCard)
  const deleteCard = useStoryboardStore((state) => state.deleteCard)
  const removeImageFromCard = useStoryboardStore((state) => state.removeImageFromCard)
  const [uploadError, setUploadError] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [pendingGenerationPreview, setPendingGenerationPreview] = useState<PendingGenerationPreview | null>(null)
  const [galleryQuery, setGalleryQuery] = useState("")
  const [galleryMediaFilter, setGalleryMediaFilter] = useState<GalleryMediaFilter>("all")
  const [galleryCardFilter, setGalleryCardFilter] = useState<GalleryCardFilter>("all")
  const [gallerySort, setGallerySort] = useState<GallerySort>("newest")
  const [galleryDensity, setGalleryDensity] = useState<GalleryDensity>("comfort")
  const [storyboardSection, setStoryboardSection] = useState<StoryboardSection>("create")
  const [composerSection, setComposerSection] = useState<ComposerSection | null>(null)
  const [templateType, setTemplateType] = useState<GenerationLibraryType>("style")
  const [cardsLibraryType, setCardsLibraryType] = useState<GenerationLibraryType | null>(null)
  const [selectedGenerationIds, setSelectedGenerationIds] = useState<string[]>([])
  const [libraryModal, setLibraryModal] = useState<{ generationIds: string[]; type: GenerationLibraryType } | null>(null)
  const [generationDetail, setGenerationDetail] = useState<GenerationResult | null>(null)
  const [videoPlayerGeneration, setVideoPlayerGeneration] = useState<GenerationResult | null>(null)
  const [cardDetail, setCardDetail] = useState<UserCard | null>(null)

  useEffect(() => {
    ensureProject(projectId)
  }, [ensureProject, projectId])

  useEffect(() => {
    if (!generating) return undefined
    const timer = window.setInterval(() => {
      setGenerationProgress((value) => Math.min(94, value + 7))
    }, 60)
    return () => window.clearInterval(timer)
  }, [generating])

  const storyboard = projectState ?? {
    selectedTemplateId: null,
    composer: {
      mode: "image" as const,
      prompt: "",
      cardType: "storyboard" as const,
      aspectRatio: "16:9" as const,
      model: "nanobanana-2" as const,
      videoModel: "seedance-2" as const,
      videoSize: "1080p" as const,
      durationSeconds: 5 as const,
      referenceImages: [],
      appliedCardIds: []
    },
    generations: [],
    cards: { style: [], storyboard: [], character: [] },
    filter: "all" as const
  }
  const selectedTemplate = storyboardTemplates.find((template) => template.id === storyboard.selectedTemplateId)
  const appliedCards = getAppliedCards(storyboard.cards, storyboard.composer.appliedCardIds ?? [])
  const appliedCardIds = appliedCards.map((card) => card.id)
  const modeGenerations = storyboard.generations.filter((generation) => generationMediaType(generation) === storyboard.composer.mode)
  const normalizedGalleryQuery = galleryQuery.trim().toLowerCase()
  const galleryCounts = storyboard.generations.reduce(
    (counts, generation) => {
      const type = generationMediaType(generation)
      return {
        all: counts.all + 1,
        image: counts.image + (type === "image" ? 1 : 0),
        video: counts.video + (type === "video" ? 1 : 0)
      }
    },
    { all: 0, image: 0, video: 0 }
  )
  const filteredGenerations = storyboard.generations
    .filter((generation) => {
      const mediaType = generationMediaType(generation)
      if (galleryMediaFilter !== "all" && mediaType !== galleryMediaFilter) return false
      if (galleryCardFilter !== "all" && (mediaType !== "image" || generation.cardType !== galleryCardFilter)) return false
      if (!normalizedGalleryQuery) return true
      const searchable = [
        generation.prompt,
        generation.templateName,
        mediaType,
        generation.cardType,
        cardTypeLabel(generation.cardType),
        modelLabel(generation.model),
        generation.aspectRatio,
        generation.videoSize,
        generation.durationSeconds ? `${generation.durationSeconds}s` : null,
        ...(generation.appliedCards ?? []).map((card) => `${card.name} ${libraryShortLabels[card.type]}`)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return searchable.includes(normalizedGalleryQuery)
    })
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime()
      const rightTime = new Date(right.createdAt).getTime()
      if (gallerySort === "oldest") return leftTime - rightTime
      if (gallerySort === "favorites-first") {
        const favoriteCompare = Number(Boolean(right.favorite)) - Number(Boolean(left.favorite))
        return favoriteCompare || rightTime - leftTime
      }
      if (gallerySort === "images-first") {
        const mediaCompare = generationMediaType(left).localeCompare(generationMediaType(right))
        return mediaCompare || rightTime - leftTime
      }
      if (gallerySort === "videos-first") {
        const mediaCompare = generationMediaType(right).localeCompare(generationMediaType(left))
        return mediaCompare || rightTime - leftTime
      }
      return rightTime - leftTime
    })
  const featuredGeneration = modeGenerations[0] ?? null
  const latestModeGenerations = modeGenerations.slice(0, 3)
  const latestStackItems: StoryboardStackItem[] = [
    ...(pendingGenerationPreview
      ? [
          {
            id: pendingGenerationPreview.id,
            title: `Creating ${mediaTypeLabel(pendingGenerationPreview.mode).toLowerCase()}`,
            description: pendingGenerationPreview.prompt,
            tag: `${Math.round(generationProgress)}%`,
            pending: true,
            media: {
              id: pendingGenerationPreview.id,
              mediaType: pendingGenerationPreview.mode,
              prompt: pendingGenerationPreview.prompt,
              cardType: pendingGenerationPreview.cardType,
              model: pendingGenerationPreview.model,
              imageUrl: pendingGenerationPreview.imageUrl,
              aspectRatio: storyboard.composer.aspectRatio,
              videoSize: pendingGenerationPreview.videoSize,
              durationSeconds: pendingGenerationPreview.durationSeconds
            }
          } satisfies StoryboardStackItem
        ]
      : []),
    ...latestModeGenerations.map(
      (generation): StoryboardStackItem => ({
        id: generation.id,
        title: generation.prompt || (generationMediaType(generation) === "video" ? "Generated clip" : "Generated frame"),
        description:
          generationMediaType(generation) === "video"
            ? `${modelLabel(generation.model)} - ${generation.videoSize ?? "1080p"} / ${generation.durationSeconds ?? 5}s`
            : `${cardTypeLabel(generation.cardType)} - ${modelLabel(generation.model)}`,
        tag: formatTimestamp(generation.createdAt),
        generation,
        media: generation
      })
    )
  ].slice(0, 3)
  const fallbackStackItems: StoryboardStackItem[] = storyboardTemplates.slice(0, 3).map((template) => ({
    id: template.id,
    title: template.name,
    description: template.description,
    tag: template.category,
    media: {
      id: template.id,
      mediaType: "image",
      prompt: template.description,
      templateName: template.name,
      cardType: template.cardType,
      model: "nanobanana-2",
      imageUrl: template.imageUrl,
      aspectRatio: "16:9"
    }
  }))
  const heroStackItems = latestStackItems.length > 0 ? latestStackItems : fallbackStackItems
  const canGenerate = storyboard.composer.prompt.trim().length > 0 && !generating
  const hasActiveGalleryFilters = Boolean(normalizedGalleryQuery) || galleryMediaFilter !== "all" || galleryCardFilter !== "all" || gallerySort !== "newest"
  const currentCreditCost =
    storyboard.composer.mode === "video"
      ? videoCreditCost(storyboard.composer.videoModel, storyboard.composer.videoSize, storyboard.composer.durationSeconds)
      : imageCreditCost(storyboard.composer.model)

  async function addFiles(files: FileList | File[]) {
    setUploadError("")
    const list = Array.from(files)
    if (storyboard.composer.referenceImages.length + list.length > MAX_REFERENCE_IMAGES) {
      setUploadError(`You can attach up to ${MAX_REFERENCE_IMAGES} reference images.`)
      return
    }
    try {
      const images = await Promise.all(list.map((file) => readReferenceFile(file)))
      images.forEach((image) => addReferenceImage(projectId, image))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Reference image upload failed.")
    }
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void addFiles(event.target.files)
    event.target.value = ""
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    if (event.dataTransfer.files.length > 0) void addFiles(event.dataTransfer.files)
  }

  async function generateMedia() {
    if (!canGenerate) return
    setGenerating(true)
    setGenerationProgress(6)
    const pendingPreview: PendingGenerationPreview = {
      id: uuid("pending-generation"),
      mode: storyboard.composer.mode,
      prompt: storyboard.composer.prompt.trim(),
      cardType: storyboard.composer.mode === "video" ? "none" : storyboard.composer.cardType,
      model: storyboard.composer.mode === "video" ? storyboard.composer.videoModel : storyboard.composer.model,
      videoSize: storyboard.composer.mode === "video" ? storyboard.composer.videoSize : undefined,
      durationSeconds: storyboard.composer.mode === "video" ? storyboard.composer.durationSeconds : undefined,
      imageUrl: createGenerationPoster({
        mode: storyboard.composer.mode,
        prompt: storyboard.composer.prompt,
        template: selectedTemplate,
        cardType: storyboard.composer.cardType,
        aspectRatio: storyboard.composer.aspectRatio,
        model: storyboard.composer.mode === "video" ? storyboard.composer.videoModel : storyboard.composer.model,
        videoSize: storyboard.composer.videoSize,
        durationSeconds: storyboard.composer.durationSeconds
      })
    }
    setPendingGenerationPreview(pendingPreview)
    const payload =
      storyboard.composer.mode === "video"
        ? {
            prompt: storyboard.composer.prompt,
            templateId: selectedTemplate?.id,
            cardType: "none" as const,
            appliedCardIds,
            referenceImages: storyboard.composer.referenceImages.map((image) => image.src),
            model: storyboard.composer.videoModel,
            videoSize: storyboard.composer.videoSize,
            durationSeconds: storyboard.composer.durationSeconds
          }
        : {
            prompt: storyboard.composer.prompt,
            templateId: selectedTemplate?.id,
            cardType: storyboard.composer.cardType,
            appliedCardIds,
            referenceImages: storyboard.composer.referenceImages.map((image) => image.src),
            aspectRatio: storyboard.composer.aspectRatio,
            model: storyboard.composer.model
          }
    const endpoint = storyboard.composer.mode === "video" ? "/api/generate/video" : "/api/generate/image"
    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => undefined)

    await new Promise((resolve) => window.setTimeout(resolve, MOCK_GENERATION_DELAY_MS))
    const generation = createGeneration(projectId, {
      mediaType: storyboard.composer.mode,
      prompt: pendingPreview.prompt,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      cardType: storyboard.composer.mode === "video" ? "none" : storyboard.composer.cardType,
      referenceImages: storyboard.composer.referenceImages,
      aspectRatio: storyboard.composer.aspectRatio,
      model: storyboard.composer.mode === "video" ? storyboard.composer.videoModel : storyboard.composer.model,
      videoSize: storyboard.composer.mode === "video" ? storyboard.composer.videoSize : undefined,
      durationSeconds: storyboard.composer.mode === "video" ? storyboard.composer.durationSeconds : undefined,
      appliedCards,
      creditCost: currentCreditCost,
      imageUrl: pendingPreview.imageUrl
    })
    setSelectedGenerationIds(generationMediaType(generation) === "image" ? [generation.id] : [])
    setGenerationProgress(100)
    window.setTimeout(() => {
      setGenerating(false)
      setPendingGenerationPreview(null)
      setGenerationProgress(0)
    }, MOCK_GENERATION_RESET_MS)
  }

  function downloadGeneration(generation: GenerationResult) {
    const link = document.createElement("a")
    const isVideo = generationMediaType(generation) === "video"
    link.href = isVideo && generation.videoUrl ? generation.videoUrl : downloadPosterDataUrl(generation)
    const extension = isVideo && generation.videoUrl ? "mp4" : "svg"
    const prefix = isVideo ? "filmgen-video" : "filmgen-generation"
    link.download = `${generation.prompt.slice(0, 48).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || prefix}.${extension}`
    link.click()
  }

  function openLibraryModal(generationIds: string[]) {
    const first = storyboard.generations.find((generation) => generation.id === generationIds[0])
    if (first && generationMediaType(first) === "video") return
    const type = first?.cardType && first.cardType !== "none" ? first.cardType : "storyboard"
    setLibraryModal({ generationIds, type })
  }

  function toggleGenerationSelection(generationId: string) {
    setSelectedGenerationIds((current) =>
      current.includes(generationId) ? current.filter((id) => id !== generationId) : [...current, generationId]
    )
  }

  function clearGallerySelection() {
    setSelectedGenerationIds([])
  }

  function updateGalleryMediaFilter(value: GalleryMediaFilter) {
    setGalleryMediaFilter(value)
    if (value === "video") setGalleryCardFilter("all")
    clearGallerySelection()
  }

  function updateGalleryCardFilter(value: GalleryCardFilter) {
    setGalleryCardFilter(value)
    clearGallerySelection()
  }

  function clearGalleryFilters() {
    setGalleryQuery("")
    setGalleryMediaFilter("all")
    setGalleryCardFilter("all")
    setGallerySort("newest")
    clearGallerySelection()
  }

function selectTemplate(template: Template) {
  setSelectedTemplate(projectId, template.id)
  setTemplateType(template.cardType)
  setComposerSection(null)
}

function openCardsLibrary(type: GenerationLibraryType) {
  setCardsLibraryType(type)
  setComposerSection(null)
}

  function toggleAppliedCard(card: UserCard) {
    const currentIds = storyboard.composer.appliedCardIds ?? []
    const alreadyApplied = currentIds.includes(card.id)
    if (!alreadyApplied && currentIds.length >= MAX_APPLIED_CARDS) return
    const appliedCardIds = alreadyApplied ? currentIds.filter((id) => id !== card.id) : [...currentIds, card.id]
    updateComposer(projectId, { appliedCardIds })
  }

  function removeAppliedCard(cardId: string) {
    updateComposer(projectId, { appliedCardIds: (storyboard.composer.appliedCardIds ?? []).filter((id) => id !== cardId) })
  }

  function openGeneration(generation: GenerationResult) {
    if (generationMediaType(generation) === "video") {
      setVideoPlayerGeneration(generation)
      return
    }
    setGenerationDetail(generation)
  }

  return (
    <StoryboardWorkspaceLayout
      toolbar={
        <div className="flex items-center justify-between gap-3 pt-1">
          <StoryboardSectionTabs
            activeSection={storyboardSection}
            mediaCount={storyboard.generations.length}
            onChange={(section) => {
              setStoryboardSection(section)
              setComposerSection(null)
              setSelectedGenerationIds([])
            }}
          />
          {storyboard.generations.length > 0 ? (
            <SendToWorkspaceButton
              generations={storyboard.generations}
              label={`Send ${storyboard.generations.length} to Workspace`}
              variant="primary"
            />
          ) : null}
        </div>
      }
      hero={
        storyboardSection === "create" ? (
          <HeroGeneration
            mode={storyboard.composer.mode}
            generation={featuredGeneration}
            pendingGeneration={pendingGenerationPreview}
            generationProgress={generationProgress}
            template={selectedTemplate}
            stackItems={heroStackItems}
          />
        ) : null
      }
      composer={
        storyboardSection === "create" ? (
          <GenerationComposer
            mode={storyboard.composer.mode}
            prompt={storyboard.composer.prompt}
            cardType={storyboard.composer.cardType}
            aspectRatio={storyboard.composer.aspectRatio}
            model={storyboard.composer.model}
            videoModel={storyboard.composer.videoModel}
            videoSize={storyboard.composer.videoSize}
            durationSeconds={storyboard.composer.durationSeconds}
            referenceImages={storyboard.composer.referenceImages}
            selectedTemplate={selectedTemplate}
            selectedTemplateId={storyboard.selectedTemplateId}
            uploadError={uploadError}
            canGenerate={canGenerate}
            composerSection={composerSection}
            templateType={templateType}
            cards={storyboard.cards}
            appliedCards={appliedCards}
            appliedCardIds={appliedCardIds}
            camera={storyboard.composer.camera}
            creditCost={currentCreditCost}
            onModeChange={(mode) => {
              updateComposer(projectId, { mode })
              setTemplateType(mode === "video" ? "storyboard" : "style")
              setSelectedGenerationIds([])
              setComposerSection(null)
            }}
            onPromptChange={(prompt) => updateComposer(projectId, { prompt })}
            onCardTypeChange={(cardType) => {
              // Also drive the template type filter so templates match the picked card type
              // (matches the user's "Both update" answer for card-type behavior).
              if (cardType !== "none") setTemplateType(cardType)
              updateComposer(projectId, { cardType })
              setComposerSection(null)
            }}
            onAspectRatioChange={(aspectRatio) => {
              updateComposer(projectId, { aspectRatio })
              setComposerSection(null)
            }}
            onModelChange={(model) => {
              updateComposer(projectId, { model })
              setComposerSection(null)
            }}
            onVideoModelChange={(videoModel) => {
              updateComposer(projectId, { videoModel })
              setComposerSection(null)
            }}
            onVideoSizeChange={(videoSize) => {
              updateComposer(projectId, { videoSize })
              setComposerSection(null)
            }}
            onDurationSecondsChange={(durationSeconds) => {
              updateComposer(projectId, { durationSeconds })
              setComposerSection(null)
            }}
            onCameraChange={(camera) => {
              updateComposer(projectId, { camera })
            }}
            onRemoveTemplate={() => setSelectedTemplate(projectId, null)}
            onReferenceInput={onFileInput}
            onReferenceDrop={onDrop}
            onRemoveReference={(imageId) => removeReferenceImage(projectId, imageId)}
            onOpenComposerSection={(section) => setComposerSection((current) => (current === section ? null : section))}
            onCloseComposerSection={() => setComposerSection(null)}
            onTemplateTypeChange={setTemplateType}
            onSelectTemplate={selectTemplate}
            onOpenCardsLibrary={openCardsLibrary}
            onToggleAppliedCard={toggleAppliedCard}
            onRemoveAppliedCard={removeAppliedCard}
            onGenerate={() => void generateMedia()}
          />
        ) : null
      }
      gallery={
        storyboardSection === "media" ? (
          <StoryboardContentSection
            eyebrow="Generated media"
            title="Media gallery"
            actions={
              <div className="border border-white/10 bg-[#101416] px-3 py-1 text-xs text-text-secondary">
                {filteredGenerations.length} of {galleryCounts.all} assets
              </div>
            }
          >
            <GalleryControls
              query={galleryQuery}
              mediaFilter={galleryMediaFilter}
              cardFilter={galleryCardFilter}
              sort={gallerySort}
              density={galleryDensity}
              counts={galleryCounts}
              hasActiveFilters={hasActiveGalleryFilters}
              onQueryChange={(value) => {
                setGalleryQuery(value)
                clearGallerySelection()
              }}
              onMediaFilterChange={updateGalleryMediaFilter}
              onCardFilterChange={updateGalleryCardFilter}
              onSortChange={(value) => {
                setGallerySort(value)
                clearGallerySelection()
              }}
              onDensityChange={setGalleryDensity}
              onClear={clearGalleryFilters}
            />

            {selectedGenerationIds.length > 0 ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-border-subtle bg-surface p-2.5">
                <span className="text-sm text-text-secondary">{selectedGenerationIds.length} selected</span>
                <Button size="sm" className="h-8 rounded-[4px] bg-accent-cyan text-xs text-black hover:brightness-110" onClick={() => openLibraryModal(selectedGenerationIds)}>
                  <Plus className="h-4 w-4" />
                  Add to Library
                </Button>
              </div>
            ) : null}
            <GenerationGrid
              generations={filteredGenerations}
              totalCount={storyboard.generations.length}
              hasActiveFilters={hasActiveGalleryFilters}
              selectedIds={selectedGenerationIds}
              density={galleryDensity}
              onSelect={toggleGenerationSelection}
              onDetail={openGeneration}
              onPlay={setVideoPlayerGeneration}
              onDownload={downloadGeneration}
              onAdd={(generation) => openLibraryModal([generation.id])}
              onFavorite={(generationId) => toggleGenerationFavorite(projectId, generationId)}
              onDelete={(generationId) => deleteGeneration(projectId, generationId)}
              onClearFilters={clearGalleryFilters}
            />
          </StoryboardContentSection>
        ) : null
      }
      overlays={
        <>
          {libraryModal ? (
            <AddToLibraryModal
              modal={libraryModal}
              cards={storyboard.cards}
              generations={storyboard.generations}
              onTypeChange={(type) => setLibraryModal((current) => (current ? { ...current, type } : current))}
              onClose={() => setLibraryModal(null)}
              onSave={(input) => {
                addCardFromGenerations(projectId, input)
                setLibraryModal(null)
                setSelectedGenerationIds([])
              }}
            />
          ) : null}
          {generationDetail ? (
            <GenerationDetailModal
              generation={generationDetail}
              onClose={() => setGenerationDetail(null)}
              onDownload={downloadGeneration}
              onAdd={(generation) => {
                setGenerationDetail(null)
                openLibraryModal([generation.id])
              }}
            />
          ) : null}
          {videoPlayerGeneration ? (
            <GeneratedVideoPlayerOverlay
              generation={videoPlayerGeneration}
              onClose={() => setVideoPlayerGeneration(null)}
              onDownload={downloadGeneration}
            />
          ) : null}
          {cardDetail ? (
            <CardDetailModal
              card={cardDetail}
              onClose={() => setCardDetail(null)}
              onRename={(name, description) => {
                renameCard(projectId, cardDetail.id, name, description)
                setCardDetail((current) => (current ? { ...current, name, description } : current))
              }}
              onDelete={() => {
                deleteCard(projectId, cardDetail.id)
                setCardDetail(null)
              }}
              onRemoveImage={(imageId) => {
                removeImageFromCard(projectId, cardDetail.id, imageId)
                setCardDetail((current) => (current ? { ...current, images: current.images.filter((image) => image.id !== imageId) } : current))
              }}
            />
          ) : null}
          {cardsLibraryType ? (
            <CardsLibraryModal
              activeType={cardsLibraryType}
              cards={storyboard.cards}
              onTypeChange={setCardsLibraryType}
              onOpenCard={setCardDetail}
              onClose={() => setCardsLibraryType(null)}
            />
          ) : null}
        </>
      }
    />
  )
}

function StoryboardSectionTabs({
  activeSection,
  mediaCount,
  onChange
}: {
  activeSection: StoryboardSection
  mediaCount: number
  onChange: (section: StoryboardSection) => void
}) {
  const tabs: Array<{ value: StoryboardSection; label: string; count?: number }> = [
    { value: "create", label: "Create" },
    { value: "media", label: "Media", count: mediaCount }
  ]

  return (
    <div className="flex items-center justify-center gap-1 pt-1">
      <div className="inline-flex border border-white/[0.10] bg-[#111517] p-1 shadow-lg shadow-black/20">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`h-8 border px-3 font-heading text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              activeSection === tab.value
                ? "border-accent-cyan bg-accent-cyan text-black"
                : "border-transparent bg-transparent text-white/58 hover:border-white/12 hover:text-accent-cyan"
            }`}
            aria-pressed={activeSection === tab.value}
          >
            {tab.label}
            {tab.count ? <span className="ml-1 opacity-70">{tab.count}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function MediaPoster({ media, className = "" }: { media: PosterMedia; className?: string }) {
  const mode = mediaMode(media)
  const palette = posterPalette(media)

  return (
    <div className={`relative overflow-hidden bg-[#030506] ${className}`}>
      {mode === "image" && isDisplayableImageUrl(media.imageUrl) ? (
        <>
          <img src={media.imageUrl} alt={media.prompt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,229,255,0.08),transparent_40%,rgba(155,89,255,0.10))]" />
          <div className="absolute inset-px rounded-[inherit] border border-white/[0.08]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: posterBackground(media) }} />
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute -left-10 top-5 h-36 w-36 rounded-full blur-3xl" style={{ background: palette.a }} />
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full blur-3xl" style={{ background: palette.b }} />
          <div className="absolute right-[9%] top-[10%] h-[32%] w-[24%] rounded-full border border-white/[0.10] bg-white/[0.055] shadow-[inset_0_1px_18px_rgba(255,255,255,0.10)] backdrop-blur-md" />
          <div className="absolute left-[10%] top-[18%] h-[52%] w-[58%] rounded-[999px] border border-white/[0.06] bg-white/[0.035] blur-sm" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,transparent_34%,rgba(0,0,0,0.30)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/42 to-transparent" />
          <div className="absolute inset-px rounded-[inherit] border border-white/[0.08] shadow-[inset_0_1px_28px_rgba(255,255,255,0.06)]" />
        </>
      )}
    </div>
  )
}

function HeroGeneration({
  mode,
  generation,
  pendingGeneration,
  generationProgress,
  template,
  stackItems
}: {
  mode: GenerationMode
  generation: GenerationResult | null
  pendingGeneration: PendingGenerationPreview | null
  generationProgress: number
  template?: Template
  stackItems: StoryboardStackItem[]
}) {
  const activeMode = pendingGeneration?.mode ?? (generation ? generationMediaType(generation) : mode)
  const isVideoGeneration = activeMode === "video"
  const isGenerating = !!pendingGeneration

  // The image to show inside the ImageGeneration card.
  // If generating, show the pending preview. If a generation exists, show it.
  // Otherwise show a placeholder gradient.
  const displayImageUrl = pendingGeneration?.imageUrl ?? generation?.imageUrl ?? "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(7,8,13,0.96) 46%, rgba(255,184,0,0.16))"
  const displayPrompt = pendingGeneration?.prompt ?? generation?.prompt ?? template?.description ?? "Describe a scene, character, mood, or style to generate your next frame."

  return (
    <section className="mx-auto grid w-full max-w-[760px] place-items-center text-center" aria-label="Generation preview">
      <ImageGeneration isGenerating={isGenerating} label={isVideoGeneration ? "clip" : "frame"} className="w-full max-w-[760px]">
        <div
          className="grid aspect-video w-full place-items-center bg-cover bg-center"
          style={{
            minHeight: "300px",
            backgroundImage: displayImageUrl.startsWith("linear-gradient")
              ? displayImageUrl
              : displayImageUrl.startsWith("data:")
                ? `url("${displayImageUrl}")`
                : `url("${displayImageUrl}")`
          }}
        >
          {!displayImageUrl || displayImageUrl.startsWith("linear-gradient") ? (
            <div className="grid place-items-center gap-2 px-6 text-center">
              <p className="text-sm leading-6 text-white/52">{displayPrompt}</p>
            </div>
          ) : null}
        </div>
      </ImageGeneration>

      {/* Prompt text below the card */}
      <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-white/52 line-clamp-2">{displayPrompt}</p>
    </section>
  )
}

function StoryboardHeroStackCard({
  item,
  active,
  progress
}: {
  item: StoryboardStackItem
  active: boolean
  progress: number
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden border bg-black shadow-2xl ${active ? "border-accent-cyan" : "border-white/[0.12]"}`}>
      <MediaPoster media={item.media} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
      <div className="absolute left-3 top-3 border border-white/[0.12] bg-black/70 px-2 py-1 font-heading text-[10px] uppercase tracking-[0.12em] text-white/70">
        {item.pending ? `${Math.round(progress)}%` : item.tag}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="line-clamp-1 font-heading text-sm font-bold text-white">{item.title}</p>
        {item.description ? <p className="mt-1 line-clamp-1 text-[11px] text-white/62">{item.description}</p> : null}
      </div>
    </div>
  )
}

function GenerationComposer({
  mode,
  prompt,
  cardType,
  aspectRatio,
  model,
  videoModel,
  videoSize,
  durationSeconds,
  referenceImages,
  selectedTemplate,
  selectedTemplateId,
  uploadError,
  canGenerate,
  composerSection,
  templateType,
  cards,
  appliedCards,
  appliedCardIds,
  camera,
  creditCost,
  onModeChange,
  onPromptChange,
  onCardTypeChange,
  onAspectRatioChange,
  onModelChange,
  onVideoModelChange,
  onVideoSizeChange,
  onDurationSecondsChange,
  onCameraChange,
  onRemoveTemplate,
  onReferenceInput,
  onReferenceDrop,
  onRemoveReference,
  onOpenComposerSection,
  onCloseComposerSection,
  onTemplateTypeChange,
  onSelectTemplate,
  onOpenCardsLibrary,
  onToggleAppliedCard,
  onRemoveAppliedCard,
  onGenerate
}: {
  mode: GenerationMode
  prompt: string
  cardType: GenerationCardType
  aspectRatio: GenerationAspectRatio
  model: ImageGenerationModel
  videoModel: VideoGenerationModel
  videoSize: VideoGenerationSize
  durationSeconds: VideoDurationSeconds
  referenceImages: GenerationReferenceImage[]
  selectedTemplate?: Template
  selectedTemplateId: string | null
  uploadError: string
  canGenerate: boolean
  composerSection: ComposerSection | null
  templateType: GenerationLibraryType
  cards: Record<GenerationLibraryType, UserCard[]>
  camera?: CameraConfig
  appliedCards: GenerationAppliedCard[]
  appliedCardIds: string[]
  creditCost: number
  onModeChange: (mode: GenerationMode) => void
  onPromptChange: (prompt: string) => void
  onCardTypeChange: (cardType: GenerationCardType) => void
  onAspectRatioChange: (aspectRatio: GenerationAspectRatio) => void
  onModelChange: (model: ImageGenerationModel) => void
  onVideoModelChange: (model: VideoGenerationModel) => void
  onVideoSizeChange: (videoSize: VideoGenerationSize) => void
  onDurationSecondsChange: (durationSeconds: VideoDurationSeconds) => void
  onCameraChange: (camera: CameraConfig) => void
  onRemoveTemplate: () => void
  onReferenceInput: (event: ChangeEvent<HTMLInputElement>) => void
  onReferenceDrop: (event: DragEvent<HTMLLabelElement>) => void
  onRemoveReference: (imageId: string) => void
  onOpenComposerSection: (section: ComposerSection) => void
  onCloseComposerSection: () => void
  onTemplateTypeChange: (type: GenerationLibraryType) => void
  onSelectTemplate: (template: Template) => void
  onOpenCardsLibrary: (type: GenerationLibraryType) => void
  onToggleAppliedCard: (card: UserCard) => void
  onRemoveAppliedCard: (cardId: string) => void
  onGenerate: () => void
}) {
  const contextCount = appliedCards.length + referenceImages.length + (selectedTemplate ? 1 : 0)
  const activeModelLabel = modelLabel(mode === "video" ? videoModel : model)
  const outputLabel = mode === "video" ? `${videoSize} / ${durationSeconds}s` : aspectRatio
  const cameraLabel = `${camera?.focalLength ?? "35"}mm ${camera?.movement ?? "locked-off"}`
  const promptPlaceholder = cardTypePromptPlaceholder(cardType, mode)

  function resizePrompt(event: ChangeEvent<HTMLTextAreaElement>) {
    const element = event.currentTarget
    onPromptChange(element.value)
    element.style.height = "auto"
    element.style.height = `${Math.min(element.scrollHeight, 72)}px`
  }

  return (
    <section className="relative mx-auto w-full max-w-[820px]">
      {/* Generation type segmented control (image mode only) — picks what kind of card you're creating */}
      {mode === "image" ? (
        <div className="mb-2 flex flex-col items-center gap-0.5">
          <p className="text-[9px] uppercase tracking-[0.1em] text-white/40">Generation type — what you're creating</p>
          <div className="inline-flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-white/[0.12] bg-[#0e1216]/95 p-0.5 shadow-lg shadow-black/30 backdrop-blur">
            {cardTypes.map(({ value, label, shortLabel, icon: Icon }) => {
              const active = cardType === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onCardTypeChange(value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] transition ${
                    active
                      ? "bg-accent-cyan text-black"
                      : "text-white/60 hover:bg-white/[0.05] hover:text-accent-cyan"
                  }`}
                  aria-pressed={active}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{shortLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
        <CompactControlTab label="Applied" value={String(appliedCards.length)} onClick={() => onOpenComposerSection("cards")} />
        <CompactControlTab label="Refs" value={String(referenceImages.length)} onClick={() => onOpenComposerSection("references")} />
        <CompactControlTab label="Camera" value={cameraLabel} onClick={() => onOpenComposerSection("camera")} />
        <CompactControlTab label="Model" value={activeModelLabel} onClick={() => onOpenComposerSection("model")} />
        <CompactControlTab label={mode === "video" ? "Video" : "Aspect"} value={outputLabel} onClick={() => onOpenComposerSection("output")} />
      </div>

      <div className="grid gap-2 border border-white/[0.14] bg-[#111418]/96 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl md:grid-cols-[74px_minmax(0,1fr)_114px] md:items-stretch">
        <div className="flex flex-col gap-1.5">
          {generationModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onModeChange(value)}
              className={`flex h-12 flex-col items-center justify-center gap-1 border px-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                mode === value
                  ? "border-accent-cyan bg-[#041923] text-accent-cyan shadow-[inset_0_0_0_1px_rgba(0,229,255,0.18)]"
                  : "border-white/[0.10] bg-[#0b0f12] text-white/55 hover:border-accent-cyan hover:text-accent-cyan"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="min-w-0">
          <div className="flex min-h-10 items-center border border-white/[0.08] bg-black/24 px-3">
            <textarea
              rows={1}
              value={prompt}
              onChange={resizePrompt}
              placeholder={promptPlaceholder}
              className="max-h-14 min-h-6 w-full resize-none bg-transparent py-1.5 text-[13px] leading-5 text-white outline-none placeholder:text-white/42"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenComposerSection("templates")}
              className="relative grid h-7 w-7 place-items-center border border-white/[0.10] bg-white text-black transition hover:border-accent-cyan hover:bg-accent-cyan"
              aria-label="Open templates"
              aria-expanded={composerSection === "templates"}
              title="Templates"
            >
              <Plus className="h-3.5 w-3.5" />
              {contextCount > 0 ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center bg-accent-cyan px-1 text-[9px] font-bold text-black">{contextCount}</span> : null}
            </button>
            <button
              type="button"
              onClick={() => onOpenComposerSection("references")}
              className="grid h-7 w-7 place-items-center border border-white/[0.10] bg-[#0b0f12] text-white/72 transition hover:border-accent-cyan hover:text-accent-cyan"
              aria-label="Open references"
              aria-expanded={composerSection === "references"}
              title="References"
            >
              <Layers3 className="h-3.5 w-3.5 rotate-90" />
            </button>

            {selectedTemplate ? (
              <span className="inline-flex max-w-[150px] items-center gap-1 border border-accent-cyan/18 bg-accent-cyan/[0.06] px-2 py-1 text-[9px] text-accent-cyan">
                <span className="truncate">{selectedTemplate.name}</span>
              </span>
            ) : null}
            {appliedCards.slice(0, 2).map((card) => (
              <button key={card.id} type="button" onClick={() => onRemoveAppliedCard(card.id)} className="inline-flex max-w-[118px] items-center gap-1 border border-accent-cyan/22 bg-accent-cyan/[0.08] px-2 py-1 text-[9px] text-accent-cyan">
                <span className="truncate">{card.name}</span>
                <X className="h-2.5 w-2.5 shrink-0" />
              </button>
            ))}
            {referenceImages.length > 0 ? (
              <button type="button" onClick={() => onOpenComposerSection("references")} className="inline-flex items-center gap-1 border border-white/[0.10] bg-black/24 px-2 py-1 text-[9px] text-white/58">
                <span>{referenceImages.length} refs</span>
              </button>
            ) : null}
          </div>
        </div>

        <Button disabled={!canGenerate} onClick={onGenerate} className="h-full min-h-12 rounded-none border border-accent-cyan/28 bg-accent-cyan px-3 font-heading text-[11px] font-bold uppercase tracking-[0.04em] text-black shadow-lg shadow-cyan hover:brightness-110">
          <Send className="h-3.5 w-3.5" />
          Generate
          <span className="text-[9px] opacity-70">{creditCost}</span>
        </Button>
      </div>

      {composerSection ? (
        <ComposerToolsMenu
          mode={mode}
          section={composerSection}
          cardType={cardType}
          aspectRatio={aspectRatio}
          model={model}
          videoModel={videoModel}
          videoSize={videoSize}
          durationSeconds={durationSeconds}
          referenceImages={referenceImages}
          selectedTemplate={selectedTemplate}
          selectedTemplateId={selectedTemplateId}
          templateType={templateType}
          cards={cards}
          appliedCards={appliedCards}
          appliedCardIds={appliedCardIds}
          camera={camera}
          onCardTypeChange={onCardTypeChange}
          onAspectRatioChange={onAspectRatioChange}
          onModelChange={onModelChange}
          onVideoModelChange={onVideoModelChange}
          onVideoSizeChange={onVideoSizeChange}
          onDurationSecondsChange={onDurationSecondsChange}
          onCameraChange={onCameraChange}
          onRemoveTemplate={onRemoveTemplate}
          onReferenceInput={onReferenceInput}
          onReferenceDrop={onReferenceDrop}
          onRemoveReference={onRemoveReference}
          onTemplateTypeChange={onTemplateTypeChange}
          onSelectTemplate={onSelectTemplate}
          onOpenCardsLibrary={(type) => {
            onOpenCardsLibrary(type)
            onCloseComposerSection()
          }}
          onToggleAppliedCard={onToggleAppliedCard}
          onRemoveAppliedCard={onRemoveAppliedCard}
          onClose={onCloseComposerSection}
        />
      ) : null}

      {uploadError ? <p className="mt-2 text-sm text-accent-red">{uploadError}</p> : null}
    </section>
  )
}

type StoryboardStackItem = CardStackItem & {
  media: PosterMedia
  generation?: GenerationResult
  pending?: boolean
}

function CompactControlTab({
  label,
  value,
  onClick
}: {
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-6 items-center gap-1 border border-white/[0.10] bg-[#1b1f22]/92 px-2 text-[10px] text-white/72 shadow-lg shadow-black/20 transition hover:border-accent-cyan hover:text-accent-cyan"
    >
      <span className="text-white/40">{label}:</span>
      <span className="max-w-[150px] truncate font-semibold">{value}</span>
    </button>
  )
}

function GalleryControls({
  query,
  mediaFilter,
  cardFilter,
  sort,
  density,
  counts,
  hasActiveFilters,
  onQueryChange,
  onMediaFilterChange,
  onCardFilterChange,
  onSortChange,
  onDensityChange,
  onClear
}: {
  query: string
  mediaFilter: GalleryMediaFilter
  cardFilter: GalleryCardFilter
  sort: GallerySort
  density: GalleryDensity
  counts: Record<GalleryMediaFilter, number>
  hasActiveFilters: boolean
  onQueryChange: (value: string) => void
  onMediaFilterChange: (value: GalleryMediaFilter) => void
  onCardFilterChange: (value: GalleryCardFilter) => void
  onSortChange: (value: GallerySort) => void
  onDensityChange: (density: GalleryDensity) => void
  onClear: () => void
}) {
  const cardFiltersDisabled = mediaFilter === "video"

  return (
    <div className="mb-3 border border-white/[0.13] bg-[#101416]/92 p-2.5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search prompt, model, type..."
            className="h-10 w-full border border-white/[0.12] bg-black/24 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-white/42 focus:border-accent-cyan focus:bg-black/35"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {mediaFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onMediaFilterChange(option.value)}
              className={`h-9 border px-2.5 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] transition ${mediaFilter === option.value ? "border-accent-cyan bg-accent-cyan/[0.14] text-accent-cyan" : "border-white/[0.11] bg-black/24 text-text-secondary hover:border-accent-cyan hover:text-accent-cyan"}`}
              aria-pressed={mediaFilter === option.value}
            >
              {option.label} {option.value !== "all" ? counts[option.value] : counts.all}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {cardFilterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={cardFiltersDisabled}
            onClick={() => onCardFilterChange(option.value)}
            className={`h-8 border px-2.5 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-40 ${cardFilter === option.value && !cardFiltersDisabled ? "border-accent-cyan bg-accent-cyan/[0.14] text-accent-cyan" : "border-white/[0.11] bg-black/20 text-text-secondary hover:border-accent-cyan hover:text-accent-cyan"}`}
            aria-pressed={cardFilter === option.value && !cardFiltersDisabled}
          >
            {option.label}
          </button>
        ))}

        <label className="ml-auto inline-flex h-8 items-center gap-2 border border-white/[0.11] bg-black/20 px-2.5 text-[11px] text-text-secondary">
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as GallerySort)}
            className="bg-transparent font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-white outline-none"
          >
            {gallerySortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-background text-white">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-flex h-8 border border-white/[0.11] bg-black/20 p-1">
          {(["comfort", "compact"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDensityChange(option)}
              className={`px-2.5 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] transition ${density === option ? "bg-accent-cyan/[0.16] text-accent-cyan" : "text-text-secondary hover:text-accent-cyan"}`}
              aria-pressed={density === option}
            >
              {option}
            </button>
          ))}
        </div>

        {hasActiveFilters ? (
          <button type="button" onClick={onClear} className="h-8 border border-white/[0.11] bg-black/20 px-2.5 text-[11px] text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan">
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  )
}

function GenerationGrid({
  generations,
  totalCount,
  hasActiveFilters,
  selectedIds,
  density,
  onSelect,
  onDetail,
  onPlay,
  onDownload,
  onAdd,
  onFavorite,
  onDelete,
  onClearFilters
}: {
  generations: GenerationResult[]
  totalCount: number
  hasActiveFilters: boolean
  selectedIds: string[]
  density: GalleryDensity
  onSelect: (generationId: string) => void
  onDetail: (generation: GenerationResult) => void
  onPlay: (generation: GenerationResult) => void
  onDownload: (generation: GenerationResult) => void
  onAdd: (generation: GenerationResult) => void
  onFavorite: (generationId: string) => void
  onDelete: (generationId: string) => void
  onClearFilters: () => void
}) {
  if (generations.length === 0) {
    return (
      <div className="grid min-h-60 place-items-center border border-dashed border-white/[0.12] bg-[#101416]/80 p-5 text-center backdrop-blur">
        <div>
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent-cyan-dim text-accent-cyan">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-primary">{totalCount === 0 ? "No generated media yet" : "No media matches these filters"}</h3>
          <p className="mt-1 text-sm text-text-muted">{totalCount === 0 ? "Generated images and videos will appear here." : "Try a different search, filter, or sort option."}</p>
          {hasActiveFilters ? (
            <Button variant="secondary" className="mt-4 rounded-full" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  const gridClass =
    density === "compact"
      ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={gridClass}>
      {generations.map((generation) => (
        <MediaGalleryCard
          key={generation.id}
          generation={generation}
          selected={selectedIds.includes(generation.id)}
          density={density}
          onSelect={() => onSelect(generation.id)}
          onDetail={() => onDetail(generation)}
          onPlay={() => onPlay(generation)}
          onDownload={() => onDownload(generation)}
          onAdd={() => onAdd(generation)}
          onFavorite={() => onFavorite(generation.id)}
          onDelete={() => onDelete(generation.id)}
        />
      ))}
    </div>
  )
}

function GalleryIconButton({ label, icon, danger, onClick }: { label: string; icon: ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`grid h-7 w-7 place-items-center border border-white/[0.14] bg-black/45 text-white shadow-lg shadow-black/25 backdrop-blur transition ${danger ? "hover:border-accent-red hover:bg-accent-red/10 hover:text-accent-red" : "hover:border-accent-cyan hover:bg-accent-cyan/[0.12] hover:text-accent-cyan"}`} aria-label={label}>
      {icon}
    </button>
  )
}

function ComposerToolsMenu({
  mode,
  section,
  cardType,
  aspectRatio,
  model,
  videoModel,
  videoSize,
  durationSeconds,
  referenceImages,
  selectedTemplate,
  selectedTemplateId,
  templateType,
  cards,
  appliedCards,
  appliedCardIds,
  camera,
  onCardTypeChange,
  onAspectRatioChange,
  onModelChange,
  onVideoModelChange,
  onVideoSizeChange,
  onDurationSecondsChange,
  onCameraChange,
  onRemoveTemplate,
  onReferenceInput,
  onReferenceDrop,
  onRemoveReference,
  onTemplateTypeChange,
  onSelectTemplate,
  onOpenCardsLibrary,
  onToggleAppliedCard,
  onRemoveAppliedCard,
  onClose
}: {
  mode: GenerationMode
  section: ComposerSection
  cardType: GenerationCardType
  aspectRatio: GenerationAspectRatio
  model: ImageGenerationModel
  videoModel: VideoGenerationModel
  videoSize: VideoGenerationSize
  durationSeconds: VideoDurationSeconds
  referenceImages: GenerationReferenceImage[]
  selectedTemplate?: Template
  selectedTemplateId: string | null
  templateType: GenerationLibraryType
  cards: Record<GenerationLibraryType, UserCard[]>
  appliedCards: GenerationAppliedCard[]
  appliedCardIds: string[]
  camera?: CameraConfig
  onCardTypeChange: (cardType: GenerationCardType) => void
  onAspectRatioChange: (aspectRatio: GenerationAspectRatio) => void
  onModelChange: (model: ImageGenerationModel) => void
  onVideoModelChange: (model: VideoGenerationModel) => void
  onVideoSizeChange: (videoSize: VideoGenerationSize) => void
  onDurationSecondsChange: (durationSeconds: VideoDurationSeconds) => void
  onCameraChange: (camera: CameraConfig) => void
  onRemoveTemplate: () => void
  onReferenceInput: (event: ChangeEvent<HTMLInputElement>) => void
  onReferenceDrop: (event: DragEvent<HTMLLabelElement>) => void
  onRemoveReference: (imageId: string) => void
  onTemplateTypeChange: (type: GenerationLibraryType) => void
  onSelectTemplate: (template: Template) => void
  onOpenCardsLibrary: (type: GenerationLibraryType) => void
  onToggleAppliedCard: (card: UserCard) => void
  onRemoveAppliedCard: (cardId: string) => void
  onClose: () => void
}) {
  const templates = storyboardTemplates.filter((template) => template.cardType === templateType)
  const totalCards = Object.values(cards).reduce((count, cardGroup) => count + cardGroup.length, 0)
  const isAtLimit = appliedCardIds.length >= MAX_APPLIED_CARDS
  const sectionTitle: Record<ComposerSection, { title: string; description: string }> = {
    templates: { title: "Templates", description: "Pick a template and narrow it by type." },
    cards: { title: "Applied cards", description: "Saved Style/Character/Storyboard references to attach as context for this generation." },
    references: { title: "References", description: "Attach reference images from files or drag and drop." },
    camera: { title: "Camera", description: "Set framing that carries into every generated shot and into the Workspace." },
    model: { title: "Model", description: "Choose the active generation model." },
    output: { title: "Output", description: mode === "video" ? "Set clip size and duration." : "Set aspect ratio. Generation type is set by the segmented control above the prompt." }
  }

  return (
    <div className={`absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 -translate-x-1/2 max-h-[min(70vh,620px)] overflow-y-auto border border-white/[0.12] bg-[#0c0f11]/96 p-2 text-left shadow-2xl shadow-black/50 backdrop-blur-2xl ${section === "camera" ? "w-[min(100vw-1rem,860px)]" : "w-[min(100vw-1rem,720px)]"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-cyan">{sectionTitle[section].title}</p>
          <p className="mt-0.5 text-[10px] text-white/48">{sectionTitle[section].description}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center border border-white/[0.12] bg-white/[0.05] text-white/70 transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close generation options">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={`${section !== "templates" ? "hidden" : ""}`}>
        <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">Templates</p>
            {selectedTemplate ? (
              <button type="button" onClick={onRemoveTemplate} className="inline-flex h-6 max-w-[180px] items-center gap-1 border border-accent-cyan/20 bg-accent-cyan/[0.08] px-2 text-[10px] text-accent-cyan">
                <span className="truncate">{selectedTemplate.name}</span>
                <X className="h-2.5 w-2.5 shrink-0" />
              </button>
            ) : null}
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {templateTypeFilters.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onTemplateTypeChange(value)}
                className={`inline-flex h-7 items-center gap-1 border px-2 text-[10px] transition ${templateType === value ? "border-accent-cyan bg-accent-cyan/[0.12] text-accent-cyan" : "border-white/[0.10] bg-black/20 text-white/58 hover:border-accent-cyan hover:text-accent-cyan"}`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {templates.slice(0, 3).map((template) => {
              const active = selectedTemplateId === template.id
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(template)
                    onClose()
                  }}
                  className={`border p-2 text-left transition ${active ? "border-accent-cyan bg-accent-cyan/[0.10]" : "border-white/[0.09] bg-black/18 hover:border-accent-cyan/70"}`}
                >
                  <span className="block truncate font-heading text-[11px] font-bold text-white">{template.name}</span>
                  <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-white/50">{template.description}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <div className={`${section !== "cards" ? "hidden" : ""}`}>
        <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">Applied cards</p>
            <span className="text-[10px] text-white/44">{appliedCardIds.length}/{MAX_APPLIED_CARDS} applied</span>
          </div>
          {totalCards === 0 ? (
            <p className="border border-dashed border-white/[0.10] p-3 text-center text-[10px] text-white/48">Save images into cards first, then apply them here.</p>
          ) : (
            <div className="grid gap-2">
              {templateTypeFilters.map(({ value }) => (
                <div key={value} className="border border-white/[0.07] bg-black/15 p-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-white/58">{libraryShortLabels[value]}</p>
                    <button type="button" onClick={() => onOpenCardsLibrary(value)} className="text-[10px] text-accent-cyan hover:text-white">Open storage</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cards[value].slice(0, 4).map((card) => {
                      const active = appliedCardIds.includes(card.id)
                      const disabled = !active && isAtLimit
                      return (
                        <button
                          key={card.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onToggleAppliedCard(card)}
                          className={`max-w-[180px] truncate border px-2.5 py-1 text-[10px] transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-accent-cyan bg-accent-cyan/[0.12] text-accent-cyan" : "border-white/[0.10] bg-black/20 text-white/62 hover:border-accent-cyan hover:text-accent-cyan"}`}
                        >
                          {card.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {appliedCards.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {appliedCards.map((card) => (
                <button key={card.id} type="button" onClick={() => onRemoveAppliedCard(card.id)} className="inline-flex max-w-[180px] items-center gap-1 border border-accent-cyan/20 bg-accent-cyan/[0.08] px-2 py-1 text-[10px] text-accent-cyan">
                  <span className="truncate">{card.name}</span>
                  <X className="h-2.5 w-2.5 shrink-0" />
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <div className={`${section !== "references" ? "hidden" : ""}`}>
        <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
          <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">References</p>
          <label
            onDrop={onReferenceDrop}
            onDragOver={(event) => event.preventDefault()}
            className="flex min-h-14 cursor-pointer items-center justify-center border border-dashed border-white/[0.12] bg-black/15 px-3 text-center text-[10px] text-white/54 transition hover:border-accent-cyan hover:text-accent-cyan"
          >
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={onReferenceInput} />
            Drop references or click to upload
          </label>
          {referenceImages.length > 0 ? (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {referenceImages.map((image) => (
                <div key={image.id} className="relative h-12 w-12 shrink-0 overflow-hidden border border-white/[0.10] bg-black/30">
                  <img src={image.src} alt={image.name} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => onRemoveReference(image.id)} className="absolute right-1 top-1 grid h-4 w-4 place-items-center bg-black/70 text-white hover:text-accent-red" aria-label={`Remove ${image.name}`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <div className={`${section !== "camera" ? "hidden" : ""}`}>
        <StoryboardComposerCameraPanel camera={camera} onChange={onCameraChange} />
      </div>

      <div className={`${section !== "model" ? "hidden" : ""}`}>
        <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
          <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">Model</p>
          {mode === "video" ? (
            <ModelOptionGroup value={videoModel} options={videoModelOptions} onSelect={(value) => onVideoModelChange(value as VideoGenerationModel)} />
          ) : (
            <ModelOptionGroup value={model} options={modelOptions} onSelect={(value) => onModelChange(value as ImageGenerationModel)} />
          )}
        </section>
      </div>

      <div className={`${section !== "output" ? "hidden" : ""}`}>
        <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
          <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">Output settings</p>
          {mode === "video" ? (
            <div className="grid gap-2">
              <OptionGroup label="Video size" options={videoSizes} value={videoSize} onSelect={(value) => onVideoSizeChange(value as VideoGenerationSize)} />
              <OptionGroup label="Seconds" options={videoDurations.map(String)} value={String(durationSeconds)} onSelect={(value) => onDurationSecondsChange(Number(value) as VideoDurationSeconds)} />
            </div>
          ) : (
            <div className="grid gap-2">
              <OptionGroup label="Aspect" options={aspectRatios} value={aspectRatio} onSelect={(value) => onAspectRatioChange(value as GenerationAspectRatio)} />
              <p className="text-[10px] text-white/42">Card type is set by the segmented control above the prompt.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function OptionGroup({
  label,
  options,
  value,
  labels,
  onSelect
}: {
  label: string
  options: string[]
  value: string
  labels?: Record<string, string>
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-1 font-heading text-[9px] font-semibold uppercase tracking-[0.1em] text-white/42">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`border px-2.5 py-1 text-[10px] transition ${
              value === option
                ? "border-accent-cyan bg-accent-cyan/[0.12] text-accent-cyan"
                : "border-white/[0.10] bg-black/20 text-white/62 hover:border-accent-cyan hover:text-accent-cyan"
            }`}
          >
            {labels?.[option] ?? option}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Compact Camera panel rendered inside the Storyboard composer's Camera accordion.
 * Mirrors the workspace CameraConfigNode's options but in a denser, single-column layout
 * that fits the composer's floating tools menu. Selected config carries into every
 * generated shot and into the Workspace graph on "Send to Workspace".
 */
function StoryboardComposerCameraPanel({
  camera,
  onChange
}: {
  camera: CameraConfig | undefined
  onChange: (next: CameraConfig) => void
}) {
  return (
    <section className="border border-white/[0.08] bg-white/[0.035] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/82">Camera</p>
        <button
          type="button"
          onClick={() => onChange({ ...defaultCameraConfig })}
          className="text-[10px] text-white/48 hover:text-accent-cyan"
        >
          Reset
        </button>
      </div>

      {/* Same visual grid as the Director mode Camera node — compact mode for the narrow composer menu */}
      <CameraConfigGrid camera={camera} onChange={onChange} compact />

      <p className="mt-2 text-[10px] leading-4 text-white/42">
        This framing applies to every generated shot. When you "Send to Workspace", each shot's Camera node inherits these defaults — you can still tweak per shot there.
      </p>
    </section>
  )
}

function ModelOptionGroup({
  value,
  options,
  onSelect
}: {
  value: ImageGenerationModel | VideoGenerationModel
  options: Array<{ value: ImageGenerationModel | VideoGenerationModel; label: string; description: string; disabled?: boolean }>
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-1 font-heading text-[9px] font-semibold uppercase tracking-[0.1em] text-white/42">Model</p>
      <div className="grid gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) onSelect(option.value)
            }}
            className={`flex items-center justify-between gap-3 border px-2.5 py-1.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
              value === option.value
                ? "border-accent-cyan bg-accent-cyan/[0.12] text-accent-cyan"
                : "border-white/[0.10] bg-black/20 text-white/68 hover:border-accent-cyan hover:text-accent-cyan"
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold">{option.label}</span>
              <span className="mt-0.5 block truncate text-[10px] text-white/42">{option.description}</span>
            </span>
            {option.disabled ? <Lock className="h-3 w-3 shrink-0" /> : value === option.value ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function MediaGalleryCard({
  generation,
  selected,
  density,
  onSelect,
  onDetail,
  onPlay,
  onDownload,
  onAdd,
  onFavorite,
  onDelete
}: {
  generation: GenerationResult
  selected: boolean
  density: GalleryDensity
  onSelect: () => void
  onDetail: () => void
  onPlay: () => void
  onDownload: () => void
  onAdd: () => void
  onFavorite: () => void
  onDelete: () => void
}) {
  const mediaType = generationMediaType(generation)
  const isVideo = mediaType === "video"
  const openLabel = isVideo ? "Open video" : "View generation"
  const openAction = isVideo ? onPlay : onDetail
  const cardAspect = density === "compact" ? "aspect-[4/3]" : "aspect-[1.28/1]"
  const titleClass = density === "compact" ? "line-clamp-1 font-heading text-sm font-bold leading-tight text-white" : "line-clamp-2 font-heading text-base font-bold leading-tight text-white"

  return (
    <article className={`group/media relative overflow-hidden border bg-[#06080c] shadow-2xl shadow-black/25 transition ${cardAspect} ${selected ? "border-accent-cyan/70 shadow-cyan" : "border-white/[0.10] hover:border-accent-cyan/40"}`}>
      <button type="button" onClick={openAction} className="absolute inset-0 block h-full w-full text-left" aria-label={`${openLabel} ${generation.prompt}`}>
        {isVideo ? (
          <VideoPreviewArtwork generation={generation} className="absolute inset-0 h-full w-full" />
        ) : (
          <MediaPoster media={generation} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover/media:scale-[1.025]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,transparent_40%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-px border border-white/[0.08] shadow-[inset_0_1px_24px_rgba(255,255,255,0.04)]" />
      </button>

      {!isVideo ? (
        <button type="button" onClick={onSelect} className={`absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center border shadow-lg shadow-black/25 backdrop-blur ${selected ? "border-accent-cyan bg-accent-cyan text-black" : "border-white/[0.12] bg-black/60 text-white hover:border-accent-cyan hover:bg-accent-cyan/[0.12] hover:text-accent-cyan"}`} aria-label={selected ? "Deselect generation" : "Select generation"}>
          {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      ) : null}

      <div className="absolute right-3 top-3 z-10 flex gap-1.5 opacity-100 transition md:opacity-0 md:group-hover/media:opacity-100 md:group-focus-within/media:opacity-100">
        <GalleryIconButton label={generation.favorite ? "Unstar generation" : "Star generation"} icon={<Star className={`h-4 w-4 ${generation.favorite ? "fill-current" : ""}`} />} onClick={onFavorite} />
        <GalleryIconButton label={openLabel} icon={isVideo ? <Play className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />} onClick={openAction} />
        <GalleryIconButton label="Download generation" icon={<Download className="h-4 w-4" />} onClick={onDownload} />
        {!isVideo ? <GalleryIconButton label="Add to library" icon={<Layers3 className="h-4 w-4" />} onClick={onAdd} /> : null}
        <GalleryIconButton label="Delete generation" danger icon={<Trash2 className="h-4 w-4" />} onClick={onDelete} />
      </div>

      <div className="absolute inset-x-3 bottom-3 z-10 border border-white/[0.10] bg-[#071016]/82 p-3 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h3 className={titleClass}>{generation.prompt}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="border border-accent-cyan/20 bg-accent-cyan/[0.08] px-2 py-0.5 text-[10px] text-accent-cyan">{isVideo ? "Video" : "Image"}</span>
          {!isVideo ? <span className="border border-white/[0.12] bg-black/24 px-2 py-0.5 text-[10px] text-white/70">{cardTypeLabel(generation.cardType)}</span> : null}
          <span className="border border-white/[0.12] bg-black/24 px-2 py-0.5 text-[10px] text-white/70">{modelLabel(generation.model)}</span>
          <span className="border border-white/[0.12] bg-black/24 px-2 py-0.5 text-[10px] text-white/70">{isVideo ? `${generation.videoSize ?? "1080p"} / ${generation.durationSeconds ?? 5}s` : generation.aspectRatio}</span>
          {generation.appliedCards?.length ? (
            <span className="border border-accent-cyan/20 bg-accent-cyan/[0.08] px-2 py-0.5 text-[10px] text-accent-cyan">
              {generation.appliedCards.length} applied card{generation.appliedCards.length === 1 ? "" : "s"}
            </span>
          ) : null}
          <span className="border border-white/[0.12] bg-black/24 px-2 py-0.5 text-[10px] text-white/62">{formatTimestamp(generation.createdAt)}</span>
        </div>
      </div>
    </article>
  )
}

function VideoPreviewArtwork({
  generation,
  active = false,
  className = ""
}: {
  generation: GenerationResult
  active?: boolean
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden bg-[#030506] ${className}`}>
      <MediaPoster media={generation} className={`absolute inset-0 h-full w-full transition-transform duration-700 ${active ? "scale-[1.035]" : "scale-100"}`} />
      <div className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/12 bg-black/35 text-accent-cyan shadow-lg shadow-black/30 backdrop-blur-md">
        <Film className="h-4 w-4" />
      </div>
      {active ? <div className="absolute inset-0 bg-accent-cyan/[0.04]" /> : null}
    </div>
  )
}

function fallbackLibraryImage(type: GenerationLibraryType) {
  return storyboardTemplates.find((template) => template.cardType === type)?.imageUrl ?? storyboardTemplates[0].imageUrl
}

function CardsLibraryModal({
  activeType,
  cards,
  onTypeChange,
  onOpenCard,
  onClose
}: {
  activeType: GenerationLibraryType
  cards: Record<GenerationLibraryType, UserCard[]>
  onTypeChange: (type: GenerationLibraryType) => void
  onOpenCard: (card: UserCard) => void
  onClose: () => void
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const activeCards = cards[activeType]

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  function openCard(card: UserCard) {
    onOpenCard(card)
    onClose()
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, onClose)} className="fixed inset-0 z-50 overflow-y-auto bg-black/82 p-3 backdrop-blur-md md:p-6">
      <section className="mx-auto min-h-full max-w-[1040px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#07090b]/96 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 md:p-5">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-accent-cyan">Saved Image Libraries</p>
            <h2 className="mt-1.5 font-heading text-2xl font-bold text-white">{libraryLabels[activeType]}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close cards library">
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="grid gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-5">
          <div className="rounded-[1.05rem] border border-white/10 bg-white/[0.05] p-1.5">
            {templateTypeFilters.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onTypeChange(value)}
                className={`mb-1.5 flex w-full items-center justify-between gap-2 rounded-[0.9rem] border p-2.5 text-left transition last:mb-0 ${activeType === value ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan" : "border-transparent text-white/68 hover:border-white/15 hover:text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-heading text-xs font-semibold">{libraryLabels[value]}</span>
                </span>
                <span className="rounded-full bg-black/35 px-2 py-0.5 text-[11px]">{cards[value].length}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[420px] rounded-[1.05rem] border border-white/10 bg-white/[0.04] p-3">
            {activeCards.length === 0 ? (
              <div className="grid min-h-[380px] place-items-center rounded-[0.9rem] border border-dashed border-white/[0.12] text-center">
                <div className="max-w-sm px-4">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent-cyan-dim text-accent-cyan">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">No saved cards here yet</h3>
                  <p className="mt-1.5 text-xs leading-5 text-white/52">Add recent images to this library to build curated reusable card collections.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeCards.map((card) => {
                  const imageUrl = card.images[0]?.imageUrl
                  return (
                    <ElitePlanCard
                      key={card.id}
                      imageUrl={isDisplayableImageUrl(imageUrl) ? imageUrl : fallbackLibraryImage(card.type)}
                      fallbackBackground={storyboardTemplates.find((template) => template.cardType === card.type)?.preview}
                      title={card.name}
                      subtitle={libraryLabels[card.type]}
                      description={card.description || `${card.images.length} saved images`}
                      highlights={[`${card.images.length} image${card.images.length === 1 ? "" : "s"}`, `Updated ${formatTimestamp(card.updatedAt)}`]}
                      actionLabel="Open Card"
                      onAction={() => openCard(card)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  )
}

function AddToLibraryModal({
  modal,
  cards,
  generations,
  onTypeChange,
  onClose,
  onSave
}: {
  modal: { generationIds: string[]; type: GenerationLibraryType }
  cards: Record<GenerationLibraryType, UserCard[]>
  generations: GenerationResult[]
  onTypeChange: (type: GenerationLibraryType) => void
  onClose: () => void
  onSave: (input: AddCardInput) => void
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const selectedGenerations = generations.filter((generation) => modal.generationIds.includes(generation.id))
  const [mode, setMode] = useState<"new" | "existing">(cards[modal.type].length > 0 ? "existing" : "new")
  const [existingCardId, setExistingCardId] = useState(cards[modal.type][0]?.id ?? "")
  const [name, setName] = useState("New Card")
  const [description, setDescription] = useState(selectedGenerations[0]?.prompt ?? "")

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {
    if (cards[modal.type].length === 0) {
      setMode("new")
      setExistingCardId("")
    } else if (!cards[modal.type].some((card) => card.id === existingCardId)) {
      setExistingCardId(cards[modal.type][0]?.id ?? "")
    }
  }, [cards, existingCardId, modal.type])

  function save() {
    onSave({
      type: modal.type,
      name,
      description,
      generationIds: modal.generationIds,
      existingCardId: mode === "existing" ? existingCardId : undefined
    })
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, onClose)} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md">
      <section className="w-full max-w-2xl rounded-[var(--radius-lg)] border border-border-subtle bg-[#07090b] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Add to Library</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary">{selectedGenerations.length} generations</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close add to library modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-text-secondary">
            Card type
            <select value={modal.type} onChange={(event) => onTypeChange(event.target.value as GenerationLibraryType)} className="h-11 rounded-[var(--radius-md)] border border-border-subtle bg-surface px-3 text-text-primary outline-none">
              <option value="style">Style Card</option>
              <option value="storyboard">Storyboard</option>
              <option value="character">Character Sheet</option>
            </select>
          </label>
          <div className="flex rounded-[var(--radius-md)] border border-border bg-surface p-1">
            <button type="button" onClick={() => setMode("existing")} disabled={cards[modal.type].length === 0} className={`h-9 flex-1 rounded px-3 text-sm ${mode === "existing" ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary disabled:opacity-40"}`}>Existing</button>
            <button type="button" onClick={() => setMode("new")} className={`h-9 flex-1 rounded px-3 text-sm ${mode === "new" ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary"}`}>Create New</button>
          </div>
          {mode === "existing" ? (
            <label className="grid gap-2 text-sm text-text-secondary">
              Existing card
              <select value={existingCardId} onChange={(event) => setExistingCardId(event.target.value)} className="h-11 rounded-[var(--radius-md)] border border-border-subtle bg-surface px-3 text-text-primary outline-none">
                {cards[modal.type].map((card) => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className="grid gap-2 text-sm text-text-secondary">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-[var(--radius-md)] border border-border-subtle bg-surface px-3 text-text-primary outline-none focus:border-accent-cyan" />
              </label>
              <label className="grid gap-2 text-sm text-text-secondary">
                Description
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-[var(--radius-md)] border border-border-subtle bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent-cyan" />
              </label>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-accent-cyan text-black hover:brightness-110" onClick={save}>Save Card</Button>
        </div>
      </section>
    </div>
  )
}

function GeneratedVideoPlayerOverlay({
  generation,
  onClose,
  onDownload
}: {
  generation: GenerationResult
  onClose: () => void
  onDownload: (generation: GenerationResult) => void
}) {
  const playerRef = useRef<HTMLDivElement | null>(null)
  const hasVideoUrl = Boolean(generation.videoUrl)
  const [loading, setLoading] = useState(!hasVideoUrl)
  const [playing, setPlaying] = useState(!hasVideoUrl)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(72)
  const [fullscreen, setFullscreen] = useState(false)
  const complete = !hasVideoUrl && progress >= 100
  const durationSeconds = generation.durationSeconds ?? 5

  useEffect(() => {
    playerRef.current?.focus()
  }, [])

  useEffect(() => {
    setProgress(0)
    setLoading(!generation.videoUrl)
    setPlaying(!generation.videoUrl)
  }, [generation.id, generation.videoUrl, generation.videoSize])

  useEffect(() => {
    if (hasVideoUrl || !loading) return undefined

    const loadingTimer = window.setTimeout(() => {
      setLoading(false)
      setPlaying(true)
    }, 500)
    return () => window.clearTimeout(loadingTimer)
  }, [hasVideoUrl, loading])

  useEffect(() => {
    if (hasVideoUrl || loading || !playing || complete) return undefined

    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(100, value + 100 / (durationSeconds * 10)))
    }, 100)
    return () => window.clearInterval(timer)
  }, [complete, durationSeconds, hasVideoUrl, loading, playing])

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose()
      if (event.key === " " && !hasVideoUrl) {
        event.preventDefault()
        if (!loading && !complete) setPlaying((value) => !value)
      }
      if (!hasVideoUrl && event.key === "ArrowRight") setProgress((value) => Math.min(100, value + 10))
      if (!hasVideoUrl && event.key === "ArrowLeft") setProgress((value) => Math.max(0, value - 10))
      if (event.key === "ArrowUp") setVolume((value) => Math.min(100, value + 10))
      if (event.key === "ArrowDown") setVolume((value) => Math.max(0, value - 10))
      if (event.key.toLowerCase() === "f") setFullscreen((value) => !value)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [complete, hasVideoUrl, loading, onClose])

  function replay() {
    setProgress(0)
    setPlaying(true)
  }

  return (
    <div ref={playerRef} role="dialog" aria-modal="true" aria-label="Generated video player" tabIndex={-1} onKeyDown={(event) => trapFocus(event, playerRef.current, onClose)} className="fixed inset-0 z-[60] grid place-items-center bg-black p-4">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close video player">
        <X className="h-4 w-4" />
      </button>

      <div className={`${fullscreen ? "h-full w-full" : "w-[min(90vw,980px)]"} max-h-[calc(100vh-2rem)] overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#030506] shadow-2xl`}>
        <div className="relative aspect-video bg-black">
          {generation.videoUrl ? (
            <video src={generation.videoUrl} poster={isDisplayableImageUrl(generation.imageUrl) ? generation.imageUrl : undefined} controls autoPlay className="absolute inset-0 h-full w-full bg-black object-contain" />
          ) : (
            <>
              <VideoPreviewArtwork generation={generation} active={playing && !complete} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(0,229,255,0.24),transparent_28%),linear-gradient(120deg,rgba(0,0,0,0.16),rgba(0,0,0,0.72))]" />
              <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                {loading ? (
                  <div className="grid place-items-center gap-3 text-accent-cyan">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="font-heading text-xs font-semibold uppercase tracking-[0.16em]">Preparing generated preview</span>
                  </div>
                ) : complete ? (
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">{cardTypeLabel(generation.cardType)}</h2>
                    <p className="mt-2 text-sm text-white/60">Preview complete</p>
                    <button type="button" onClick={replay} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-white px-3.5 font-heading text-xs font-bold uppercase tracking-[0.08em] text-black">
                      <RotateCcw className="h-4 w-4" />
                      Replay
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
                      {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 fill-current" />}
                    </div>
                    <h2 className="max-w-2xl font-heading text-2xl font-bold text-white md:text-3xl">{cardTypeLabel(generation.cardType)}</h2>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-white/68">{generation.prompt}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="grid gap-3 border-t border-white/10 bg-black/80 p-3 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
          <button type="button" disabled={hasVideoUrl || loading || complete} onClick={() => setPlaying((value) => !value)} className="inline-flex h-9 w-fit min-w-24 items-center justify-center gap-2 justify-self-start rounded-[var(--radius-md)] bg-white px-4 text-xs font-semibold text-black disabled:opacity-50">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            {playing ? "Pause" : "Play"}
          </button>
          <label className="grid gap-1 text-xs text-white/60">
            Progress
            <input type="range" min={0} max={100} value={progress} disabled={hasVideoUrl} onChange={(event) => setProgress(Number(event.target.value))} className="accent-accent-cyan disabled:opacity-50" aria-label="Playback progress" />
          </label>
          <label className="flex w-fit items-center gap-2 text-xs text-white/60">
            <Volume2 className="h-4 w-4" />
            <input type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-20 accent-accent-cyan" aria-label="Volume" />
          </label>
          <div className="inline-flex h-9 w-fit items-center rounded-[var(--radius-md)] border border-white/10 bg-white/10 px-2.5 text-xs text-white/72">
            {generation.videoSize ?? "1080p"} / {durationSeconds}s
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => onDownload(generation)} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-white/70 transition hover:text-white" aria-label="Download generated video">
              <Download className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setFullscreen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-white/70 transition hover:text-white" aria-label="Toggle fullscreen">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GenerationDetailModal({
  generation,
  onClose,
  onDownload,
  onAdd
}: {
  generation: GenerationResult
  onClose: () => void
  onDownload: (generation: GenerationResult) => void
  onAdd: (generation: GenerationResult) => void
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const mode = generationMediaType(generation)

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, onClose)} className="fixed inset-0 z-50 overflow-y-auto bg-black/82 p-3 backdrop-blur-md md:p-6">
      <section className="mx-auto min-h-full max-w-[980px] overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#07090b] shadow-2xl">
        <div className="relative min-h-[460px] overflow-hidden">
          <MediaPoster media={generation} className="absolute inset-0 h-full w-full opacity-70 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/58 to-black/10" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close generation detail">
            <X className="h-4 w-4" />
          </button>
          <div className="relative z-10 max-w-2xl p-5 pt-20 md:p-8 md:pt-28">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-accent-cyan">Generated {mediaTypeLabel(mode)}</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-none text-white md:text-5xl">{cardTypeLabel(generation.cardType)}</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">{generation.prompt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                modelLabel(generation.model),
                mode === "video" ? generation.videoSize ?? "1080p" : generation.aspectRatio,
                mode === "video" ? `${generation.durationSeconds ?? 5}s` : null,
                `${generation.creditCost} credits`,
                formatTimestamp(generation.createdAt)
              ].filter(Boolean).map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">{item}</span>
              ))}
            </div>
            {generation.appliedCards?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {generation.appliedCards.map((card) => (
                  <span key={card.id} className="rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.08] px-3 py-1 text-xs text-accent-cyan">
                    {libraryShortLabels[card.type]}: {card.name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="h-9 bg-accent-cyan px-3 text-xs text-black hover:brightness-110" onClick={() => onDownload(generation)}><Download className="h-4 w-4" />Download</Button>
              {mode !== "video" ? <Button variant="secondary" className="h-9 px-3 text-xs" onClick={() => onAdd(generation)}><Plus className="h-4 w-4" />Add to Library</Button> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CardDetailModal({
  card,
  onClose,
  onRename,
  onDelete,
  onRemoveImage
}: {
  card: UserCard
  onClose: () => void
  onRename: (name: string, description: string) => void
  onDelete: () => void
  onRemoveImage: (imageId: string) => void
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [name, setName] = useState(card.name)
  const [description, setDescription] = useState(card.description)
  useEffect(() => {
    modalRef.current?.focus()
  }, [])
  return (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, onClose)} className="fixed inset-0 z-50 overflow-y-auto bg-black/82 p-3 backdrop-blur-md md:p-6">
      <section className="mx-auto min-h-full max-w-[980px] overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#07090b] shadow-2xl">
        <div className="relative min-h-[360px] overflow-hidden">
          {card.images[0] ? (
            <MediaPoster
              media={{
                prompt: card.images[0].prompt,
                cardType: card.type,
                model: "nanobanana-2",
                imageUrl: card.images[0].imageUrl,
                aspectRatio: "16:9"
              }}
              className="absolute inset-0 h-full w-full opacity-55"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/72 to-black/22" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close card detail">
            <X className="h-4 w-4" />
          </button>
          <div className="relative z-10 max-w-2xl p-5 pt-20 md:p-8 md:pt-24">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-accent-cyan">{libraryLabels[card.type]}</p>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-3 w-full bg-transparent font-heading text-3xl font-bold leading-none text-white outline-none md:text-5xl" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-4 min-h-16 w-full resize-none rounded-[var(--radius-md)] border border-white/10 bg-black/30 p-3 text-sm leading-6 text-white/80 outline-none focus:border-accent-cyan" />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="h-9 bg-accent-cyan px-3 text-xs text-black hover:brightness-110" onClick={() => onRename(name, description)}>Rename</Button>
              <Button variant="danger" className="h-9 px-3 text-xs" onClick={onDelete}><Trash2 className="h-4 w-4" />Delete</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {card.images.map((image) => (
            <article key={image.id} className="relative overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-surface">
              <MediaPoster
                media={{
                  prompt: image.prompt,
                  cardType: card.type,
                  model: "nanobanana-2",
                  imageUrl: image.imageUrl,
                  aspectRatio: "16:9"
                }}
                className="aspect-video w-full"
              />
              <button type="button" onClick={() => onRemoveImage(image.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white transition hover:text-accent-red" aria-label="Remove image from card">
                <X className="h-4 w-4" />
              </button>
              <p className="line-clamp-2 p-3 text-sm text-text-secondary">{image.prompt}</p>
            </article>
          ))}
        </div>
      </section>
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

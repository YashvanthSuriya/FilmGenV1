import type { ProjectSlot, ProjectAsset } from "@/lib/types"

export interface ProjectRepository {
  readonly maxProjects: number
  loadProjects: () => ProjectSlot[]
  saveProjects: (projects: ProjectSlot[]) => void
}

export class LocalProjectRepository implements ProjectRepository {
  readonly maxProjects: number
  private readonly storageKey: string

  constructor(storageKey = "filmgen-local-projects", maxProjects = 5) {
    this.storageKey = storageKey
    this.maxProjects = maxProjects
  }

  loadProjects() {
    if (typeof window === "undefined") return []
    try {
      const stored = window.localStorage.getItem(this.storageKey)
      if (!stored) return []
      const parsed = JSON.parse(stored) as ProjectSlot[]
      return Array.isArray(parsed) ? parsed.slice(0, this.maxProjects) : []
    } catch {
      return []
    }
  }

  saveProjects(projects: ProjectSlot[]) {
    if (typeof window === "undefined") return

    // Strip large data URLs from assets before persisting to localStorage.
    // Data URLs (base64-encoded images) can be several MB each, which quickly
    // exceeds the 5-10 MB localStorage quota. We replace them with a small
    // placeholder string so the asset still exists in state (for the current
    // session) but doesn't bloat persistence. The image is lost on page reload
    // — acceptable for local demo mode. In production, images would be stored
    // in R2/Convex, not localStorage.
    const compacted = projects.slice(0, this.maxProjects).map((project) => ({
      ...project,
      assets: project.assets.map(stripAssetDataUrls),
      styleCards: project.styleCards.map((s) => ({
        ...s,
        referenceImages: s.referenceImages.map(stripDataUrl),
        generatedImages: s.generatedImages.map(stripDataUrl)
      })),
      characters: project.characters.map((c) => ({
        ...c,
        portraitUrls: c.portraitUrls.map(stripDataUrl)
      }))
    }))

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(compacted))
    } catch (error) {
      // QuotaExceededError — localStorage is full. Silently fail rather than
      // crashing the app. The user's session state is still intact in memory;
      // only persistence is lost. Log a warning so it's debuggable.
      console.warn("[FilmGen] localStorage quota exceeded — project state not persisted. Consider clearing browser data.", error)
    }
  }
}

/**
 * Replace data: URLs (base64-encoded images) with a placeholder string.
 * Keeps linear-gradient() strings and http URLs intact.
 */
function stripDataUrl(url: string): string {
  if (typeof url === "string" && url.startsWith("data:")) {
    return "stripped:data-url"
  }
  return url
}

/**
 * Strip data URLs from a ProjectAsset's url and thumbnailUrl fields.
 * Keeps everything else (id, name, prompt, type, etc.) intact.
 */
function stripAssetDataUrls(asset: ProjectAsset): ProjectAsset {
  return {
    ...asset,
    url: asset.url ? stripDataUrl(asset.url) : asset.url,
    thumbnailUrl: asset.thumbnailUrl ? stripDataUrl(asset.thumbnailUrl) : asset.thumbnailUrl
  }
}

export const projectRepository = new LocalProjectRepository()

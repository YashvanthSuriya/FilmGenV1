import type { ProjectSlot } from "@/lib/types"

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
    window.localStorage.setItem(this.storageKey, JSON.stringify(projects.slice(0, this.maxProjects)))
  }
}

export const projectRepository = new LocalProjectRepository()

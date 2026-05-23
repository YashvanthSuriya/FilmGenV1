export const studioTabs = ["storyboard", "workspace", "editing", "export"] as const

export type StudioTab = (typeof studioTabs)[number]
export type PlanTier = "free" | "creator" | "filmmaker" | "director"
export type CreditEventType = "spend" | "purchase" | "refund" | "reset"

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

export interface WorkspaceNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface WorkspaceEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

export interface GeneratedMedia {
  id: string
  type: "image" | "video" | "audio" | "script"
  url?: string
  prompt?: string
  creditsUsed: number
  createdAt: string
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

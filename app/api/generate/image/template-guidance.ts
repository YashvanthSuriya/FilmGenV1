import type { GenerationLibraryType } from "@/lib/types"

interface ServerTemplatePromptPlan {
  cardType: GenerationLibraryType
  promptGuidance: string[]
}

const serverTemplatePromptPlans: Record<string, ServerTemplatePromptPlan> = {
  "cinematic-noir": {
    cardType: "style",
    promptGuidance: ["high contrast", "dramatic shadows", "film grain", "moody lighting"]
  },
  "sci-fi-concept": {
    cardType: "storyboard",
    promptGuidance: ["futuristic environment", "neon accents", "clean geometric lines"]
  },
  "fantasy-landscape": {
    cardType: "style",
    promptGuidance: ["epic fantasy landscape", "magical atmosphere", "painterly style"]
  },
  "cyberpunk-street": {
    cardType: "style",
    promptGuidance: ["cyberpunk street scene", "rainy atmosphere", "neon reflections"]
  },
  "anime-style": {
    cardType: "character",
    promptGuidance: ["anime art style", "clean linework", "vibrant colors", "expressive"]
  }
}

export function resolveServerTemplatePromptPlan(templateId: string | undefined) {
  if (!templateId) return null
  return serverTemplatePromptPlans[templateId] ?? null
}

export function createServerPromptRuntimePlan({
  sanitizedPrompt,
  templateId
}: {
  sanitizedPrompt: string
  templateId: string | undefined
}) {
  const templatePlan = resolveServerTemplatePromptPlan(templateId)
  return {
    userPrompt: sanitizedPrompt,
    templatePlan,
    templateResolved: Boolean(templatePlan)
  }
}

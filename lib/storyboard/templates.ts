import type { Template } from "@/lib/types"

export const storyboardTemplates: Template[] = [
  {
    id: "cinematic-noir",
    name: "Cinematic Noir",
    description: "High contrast, dramatic shadows",
    guidanceSummary: "Server-applied noir mood, contrast, grain, and dramatic lighting guidance.",
    category: "Cinematic",
    cardType: "style",
    preview: "linear-gradient(135deg, rgba(0,229,255,0.32), rgba(3,5,9,0.96) 42%, rgba(255,184,0,0.18))",
    imageUrl: "/filmgen-reference/solaris-eclipse.png",
    examples: ["Rain-lit alley key art", "Detective close-up with hard rim light", "Shadow-heavy urban frame"]
  },
  {
    id: "sci-fi-concept",
    name: "Sci-Fi Concept",
    description: "Futuristic spaces and clean forms",
    guidanceSummary: "Server-applied futuristic environment, neon, and clean geometric design guidance.",
    category: "Concept",
    cardType: "storyboard",
    preview: "linear-gradient(135deg, rgba(77,125,255,0.34), rgba(6,10,18,0.94) 45%, rgba(0,229,255,0.2))",
    imageUrl: "/filmgen-reference/solaris-eclipse.png",
    examples: ["Orbital station establishing shot", "Minimal neon city plan", "Geometric interior exploration"]
  },
  {
    id: "fantasy-landscape",
    name: "Fantasy Landscape",
    description: "Epic painterly worlds",
    guidanceSummary: "Server-applied fantasy landscape, magical atmosphere, and painterly world guidance.",
    category: "Environment",
    cardType: "style",
    preview: "linear-gradient(135deg, rgba(0,255,148,0.22), rgba(8,13,10,0.96) 46%, rgba(255,184,0,0.2))",
    imageUrl: "/filmgen-reference/solaris-eclipse.png",
    examples: ["Mountain citadel at dawn", "Magical forest reveal", "Painterly kingdom concept"]
  },
  {
    id: "cyberpunk-street",
    name: "Cyberpunk Street",
    description: "Rain, neon, and reflective streets",
    guidanceSummary: "Server-applied cyberpunk street, rain, neon, and reflective surface guidance.",
    category: "Cinematic",
    cardType: "style",
    preview: "linear-gradient(135deg, rgba(0,229,255,0.32), rgba(6,7,12,0.96) 40%, rgba(255,69,69,0.2))",
    imageUrl: "/filmgen-reference/solaris-eclipse.png",
    examples: ["Wet market chase", "Neon storefront profile", "Night traffic mood board"]
  },
  {
    id: "anime-style",
    name: "Anime Style",
    description: "Clean linework and vibrant emotion",
    guidanceSummary: "Server-applied anime style, clean linework, color, and expressive character guidance.",
    category: "Character",
    cardType: "character",
    preview: "linear-gradient(135deg, rgba(155,89,255,0.32), rgba(9,8,18,0.96) 42%, rgba(0,229,255,0.24))",
    imageUrl: "/filmgen-reference/solaris-eclipse.png",
    examples: ["Lead character expression set", "Colorful action pose", "Stylized portrait card"]
  }
]

export function getStoryboardTemplate(templateId: string | null | undefined) {
  return storyboardTemplates.find((template) => template.id === templateId)
}

import type { ActionCard, Character, StyleCard, WorkspaceEdge, WorkspaceNode, WorkspaceNodeData, WorkspaceNodeType } from "@/lib/types"

export type WorkflowTemplateId = "single-shot" | "image-to-video" | "three-shot-scene" | "character-scene"

export interface WorkflowTemplate {
  id: WorkflowTemplateId
  name: string
  description: string
}

export interface WorkflowTemplateContext {
  styleCards: StyleCard[]
  characters: Character[]
  actionCards: ActionCard[]
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "single-shot",
    name: "Single Shot",
    description: "Style, character, action, prompt, camera, image output, preview."
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description: "Generate a still, then convert it into a motion clip."
  },
  {
    id: "three-shot-scene",
    name: "Three Shot Scene",
    description: "One visual language feeding three separate generated shots."
  },
  {
    id: "character-scene",
    name: "Character Scene",
    description: "Character, script, shot builder, video output, preview."
  }
]

const defaultCamera = {
  lens: "35mm",
  movement: "dolly",
  angle: "eye-level",
  aperture: "f/2.8",
  fps: 24
}

function createNodeFactory(templateId: WorkflowTemplateId) {
  const stamp = Date.now().toString(36)
  return (id: string, type: WorkspaceNodeType, x: number, y: number, data: WorkspaceNodeData = {}): WorkspaceNode => ({
    id: `${templateId}-${id}-${stamp}`,
    type,
    position: { x, y },
    data: {
      label: data.label ?? id.replace(/-/g, " "),
      status: "idle",
      ...data
    }
  })
}

function edge(source: WorkspaceNode, target: WorkspaceNode): WorkspaceEdge {
  return {
    id: `edge-${source.id}-${target.id}`,
    source: source.id,
    target: target.id,
    type: "custom",
    animated: true,
    data: { status: "idle" }
  }
}

function first<T extends { id: string }>(items: T[]) {
  return items[0]?.id
}

export function buildWorkflowTemplate(templateId: WorkflowTemplateId, context: WorkflowTemplateContext) {
  const makeNode = createNodeFactory(templateId)
  const styleCardId = first(context.styleCards)
  const characterId = first(context.characters)
  const secondCharacterId = context.characters[1]?.id ?? characterId
  const actionCardId = first(context.actionCards)

  if (templateId === "single-shot") {
    const style = makeNode("style", "styleCard", 80, 120, { label: "Look", styleCardId })
    const character = makeNode("character", "character", 80, 350, { label: "Cast", characterId })
    const action = makeNode("action", "actionCard", 380, 240, { label: "Beat", actionCardId })
    const prompt = makeNode("prompt", "prompt", 700, 160, { label: "Shot Prompt", prompt: "A clean cinematic establishing shot that clearly shows the character, location, and story tension." })
    const camera = makeNode("camera", "cameraConfig", 700, 400, { label: "Camera Plan", camera: defaultCamera })
    const image = makeNode("image", "imageOutput", 1060, 220, { label: "Generated Frame" })
    const preview = makeNode("preview", "preview", 1420, 220, { label: "Sequence Preview" })
    const nodes = [style, character, action, prompt, camera, image, preview]
    const edges = [edge(style, prompt), edge(character, prompt), edge(action, prompt), edge(prompt, image), edge(camera, image), edge(image, preview)]
    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.72 } }
  }

  if (templateId === "image-to-video") {
    const style = makeNode("style", "styleCard", 80, 110, { label: "Visual Style", styleCardId })
    const character = makeNode("character", "character", 80, 340, { label: "Hero", characterId })
    const prompt = makeNode("prompt", "prompt", 420, 170, { label: "Image Prompt", prompt: "A production-ready keyframe with strong silhouette, clean composition, and clear environmental storytelling." })
    const camera = makeNode("camera", "cameraConfig", 420, 410, { label: "Motion Plan", camera: { ...defaultCamera, movement: "slow push-in" } })
    const image = makeNode("image", "imageOutput", 780, 180, { label: "Source Frame" })
    const video = makeNode("video", "videoOutput", 1140, 180, { label: "Motion Clip" })
    const preview = makeNode("preview", "preview", 1500, 180, { label: "Playable Sequence" })
    const nodes = [style, character, prompt, camera, image, video, preview]
    const edges = [edge(style, prompt), edge(character, prompt), edge(prompt, image), edge(camera, image), edge(image, video), edge(camera, video), edge(video, preview)]
    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.7 } }
  }

  if (templateId === "three-shot-scene") {
    const style = makeNode("style", "styleCard", 40, 120, { label: "Scene Look", styleCardId })
    const character = makeNode("character", "character", 40, 360, { label: "Lead", characterId })
    const promptA = makeNode("prompt-a", "prompt", 400, 40, { label: "Shot 01 Wide", prompt: "Wide establishing frame that introduces the space, the character position, and the central obstacle." })
    const promptB = makeNode("prompt-b", "prompt", 400, 290, { label: "Shot 02 Medium", prompt: "Medium shot that tracks the character making a decisive move under pressure." })
    const promptC = makeNode("prompt-c", "prompt", 400, 540, { label: "Shot 03 Close", prompt: "Close-up reaction frame that reveals the emotional cost of the decision." })
    const cameraA = makeNode("camera-a", "cameraConfig", 740, 60, { label: "Wide Camera", camera: { ...defaultCamera, lens: "24mm", movement: "locked-off" } })
    const cameraB = makeNode("camera-b", "cameraConfig", 740, 310, { label: "Medium Camera", camera: { ...defaultCamera, lens: "35mm", movement: "tracking" } })
    const cameraC = makeNode("camera-c", "cameraConfig", 740, 560, { label: "Close Camera", camera: { ...defaultCamera, lens: "85mm", movement: "slow push-in" } })
    const imageA = makeNode("image-a", "imageOutput", 1100, 40, { label: "Shot 01 Frame" })
    const imageB = makeNode("image-b", "imageOutput", 1100, 290, { label: "Shot 02 Frame" })
    const imageC = makeNode("image-c", "imageOutput", 1100, 540, { label: "Shot 03 Frame" })
    const preview = makeNode("preview", "preview", 1480, 290, { label: "Scene Preview" })
    const nodes = [style, character, promptA, promptB, promptC, cameraA, cameraB, cameraC, imageA, imageB, imageC, preview]
    const edges = [
      edge(style, promptA),
      edge(style, promptB),
      edge(style, promptC),
      edge(character, promptA),
      edge(character, promptB),
      edge(character, promptC),
      edge(promptA, imageA),
      edge(cameraA, imageA),
      edge(promptB, imageB),
      edge(cameraB, imageB),
      edge(promptC, imageC),
      edge(cameraC, imageC),
      edge(imageA, preview),
      edge(imageB, preview),
      edge(imageC, preview)
    ]
    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.58 } }
  }

  const style = makeNode("style", "styleCard", 80, 90, { label: "Scene Style", styleCardId })
  const characterA = makeNode("character-a", "character", 80, 300, { label: "Lead", characterId })
  const characterB = makeNode("character-b", "character", 80, 510, { label: "Support", characterId: secondCharacterId })
  const script = makeNode("script", "script", 430, 240, { label: "Script Beat", script: "The lead hides the truth. The second character notices, but chooses not to say it yet." })
  const builder = makeNode("shot-builder", "combiner", 760, 280, { label: "Shot Builder" })
  const camera = makeNode("camera", "cameraConfig", 760, 510, { label: "Blocking Camera", camera: { ...defaultCamera, lens: "50mm", movement: "subtle handheld" } })
  const video = makeNode("video", "videoOutput", 1120, 300, { label: "Dialogue Clip" })
  const preview = makeNode("preview", "preview", 1480, 300, { label: "Scene Preview" })
  const nodes = [style, characterA, characterB, script, builder, camera, video, preview]
  const edges = [edge(style, builder), edge(characterA, builder), edge(characterB, builder), edge(script, builder), edge(builder, video), edge(camera, video), edge(video, preview)]
  return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.68 } }
}

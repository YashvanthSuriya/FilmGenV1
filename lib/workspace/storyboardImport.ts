import type { CameraConfig, GenerationResult, StyleCard, Character, ActionCard, WorkspaceEdge, WorkspaceNode } from "@/lib/types"

const DEFAULT_CAMERA: CameraConfig = {
  body: "full-frame-cine",
  lens: "compact-anamorphic",
  focalLength: "35",
  movement: "locked-off",
  angle: "eye-level",
  aperture: "f/2.8",
  fps: 24
}

export interface StoryboardToWorkspaceInput {
  generations: GenerationResult[]
  styleCards: StyleCard[]
  characters: Character[]
  actionCards: ActionCard[]
  styleCardId?: string
  characterId?: string
  includeActionCard?: boolean
  camera?: CameraConfig
  assetIdByGenId?: Map<string, string>
}

export interface BuiltWorkspace {
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  viewport: { x: number; y: number; zoom: number }
  skipped: number
}

export function buildWorkspaceFromStoryboard(input: StoryboardToWorkspaceInput): BuiltWorkspace {
  const {
    generations,
    styleCards,
    characters,
    actionCards,
    styleCardId,
    characterId,
    includeActionCard = false,
    camera = DEFAULT_CAMERA,
    assetIdByGenId
  } = input

  const stamp = Date.now().toString(36)
  const nodes: WorkspaceNode[] = []
  const edges: WorkspaceEdge[] = []

  const resolvedStyleId = styleCardId
  const resolvedCharacterId = characterId
  const resolvedActionId = includeActionCard ? actionCards[0]?.id : undefined

  const styleNode: WorkspaceNode | null = resolvedStyleId
    ? {
        id: `sb-style-${stamp}`,
        type: "styleCard",
        position: { x: 40, y: 80 },
        data: { label: styleCards.find((s) => s.id === resolvedStyleId)?.name ?? "Style", styleCardId: resolvedStyleId, status: "idle" }
      }
    : null

  const characterNode: WorkspaceNode | null = resolvedCharacterId
    ? {
        id: `sb-character-${stamp}`,
        type: "character",
        position: { x: 40, y: 320 },
        data: { label: characters.find((c) => c.id === resolvedCharacterId)?.name ?? "Character", characterId: resolvedCharacterId, status: "idle" }
      }
    : null

  const actionNode: WorkspaceNode | null = (includeActionCard && resolvedActionId)
    ? {
        id: `sb-action-${stamp}`,
        type: "actionCard",
        position: { x: 40, y: 560 },
        data: { label: actionCards.find((a) => a.id === resolvedActionId)?.title ?? "Action", actionCardId: resolvedActionId, status: "idle" }
      }
    : null

  if (styleNode) nodes.push(styleNode)
  if (characterNode) nodes.push(characterNode)
  if (actionNode) nodes.push(actionNode)

  const SHOT_VERTICAL_SPACING = 200
  const SHOT_START_Y = 40

  generations.forEach((gen, index) => {
    const y = SHOT_START_Y + index * SHOT_VERTICAL_SPACING
    const promptNode: WorkspaceNode = {
      id: `sb-prompt-${index}-${stamp}`,
      type: "prompt",
      position: { x: 420, y },
      data: {
        label: gen.templateName ?? `Shot ${String(index + 1).padStart(2, "0")}`,
        prompt: gen.prompt || `Shot ${index + 1} from storyboard`,
        status: "idle"
      }
    }
    const cameraNode: WorkspaceNode = {
      id: `sb-camera-${index}-${stamp}`,
      type: "cameraConfig",
      position: { x: 760, y },
      data: {
        label: `Shot ${String(index + 1).padStart(2, "0")} Camera`,
        camera: { ...camera },
        status: "idle"
      }
    }
    const importedAssetId = assetIdByGenId?.get(gen.id)
    const imageNode: WorkspaceNode = {
      id: `sb-image-${index}-${stamp}`,
      type: "imageOutput",
      position: { x: 1100, y },
      data: {
        label: `Shot ${String(index + 1).padStart(2, "0")} Frame`,
        status: importedAssetId ? "completed" : "idle",
        previewUrl: gen.imageUrl,
        output: importedAssetId
          ? `Imported from Storyboard. Asset ready — Send to Editing works immediately.`
          : `Imported from Storyboard. Click Run Image to create a workspace asset.`,
        assetId: importedAssetId,
        sourcePrompt: gen.prompt,
        lastRunAt: importedAssetId ? new Date().toISOString() : undefined
      }
    }

    nodes.push(promptNode, cameraNode, imageNode)

    if (styleNode) edges.push(makeEdge(styleNode, promptNode))
    if (characterNode) edges.push(makeEdge(characterNode, promptNode))
    if (actionNode) edges.push(makeEdge(actionNode, promptNode))
    edges.push(makeEdge(promptNode, imageNode))
    edges.push(makeEdge(cameraNode, imageNode))
  })

  const outputCount = generations.length
  const previewY = outputCount > 0 ? SHOT_START_Y + ((outputCount - 1) * SHOT_VERTICAL_SPACING) / 2 : 200
  const previewNode: WorkspaceNode = {
    id: `sb-preview-${stamp}`,
    type: "preview",
    position: { x: 1460, y: previewY },
    data: { label: "Storyboard Sequence", status: "idle" }
  }
  nodes.push(previewNode)

  const imageOutputs = nodes.filter((n) => n.type === "imageOutput")
  for (const img of imageOutputs) {
    edges.push(makeEdge(img, previewNode))
  }

  const zoom = outputCount > 3 ? 0.45 : outputCount > 1 ? 0.6 : 0.75

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom },
    skipped: 0
  }
}

function makeEdge(source: WorkspaceNode, target: WorkspaceNode): WorkspaceEdge {
  return {
    id: `edge-${source.id}-${target.id}`,
    source: source.id,
    target: target.id,
    type: "custom",
    animated: true,
    data: { status: "idle" }
  }
}

import type { ActionCard, Character, StyleCard, WorkspaceEdge, WorkspaceNode, WorkspaceNodeData, WorkspaceNodeType } from "@/lib/types"

export type WorkflowTemplateId = "single-shot" | "image-to-video" | "three-shot-scene" | "character-scene" | "short-film-structure" | "interview-with-broll"

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
    description: "Style + Character + Action + Prompt + Camera → Image → Preview. One complete shot."
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description: "Generate a still frame first, then animate it into a motion clip."
  },
  {
    id: "three-shot-scene",
    name: "Three Shot Scene",
    description: "One shared Style + Character feeds three separate shots (wide, medium, close)."
  },
  {
    id: "character-scene",
    name: "Character Scene",
    description: "Two characters + a dialogue prompt → Video → Preview. For conversation scenes."
  },
  {
    id: "short-film-structure",
    name: "Short Film Structure",
    description: "Five-shot narrative: cold open → title → beat 1 → beat 2 → tag. For 30s–2min shorts."
  },
  {
    id: "interview-with-broll",
    name: "Interview + B-roll",
    description: "One locked-off interview + three B-roll prompts sharing the same style. For documentary shorts."
  }
]

const defaultCamera = {
  body: "full-frame-cine",
  lens: "compact-anamorphic",
  focalLength: "35",
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
    const cameraA = makeNode("camera-a", "cameraConfig", 740, 60, { label: "Wide Camera", camera: { ...defaultCamera, focalLength: "24", movement: "locked-off" } })
    const cameraB = makeNode("camera-b", "cameraConfig", 740, 310, { label: "Medium Camera", camera: { ...defaultCamera, focalLength: "35", movement: "tracking" } })
    const cameraC = makeNode("camera-c", "cameraConfig", 740, 560, { label: "Close Camera", camera: { ...defaultCamera, focalLength: "85", movement: "slow push-in" } })
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

  if (templateId === "short-film-structure") {
    return buildShortFilmStructure(makeNode, context, edge)
  }

  if (templateId === "interview-with-broll") {
    return buildInterviewWithBroll(makeNode, context, edge)
  }

  const style = makeNode("style", "styleCard", 80, 90, { label: "Scene Style", styleCardId })
  const characterA = makeNode("character-a", "character", 80, 300, { label: "Lead", characterId })
  const characterB = makeNode("character-b", "character", 80, 510, { label: "Support", characterId: secondCharacterId })
  const prompt = makeNode("prompt", "prompt", 430, 240, { label: "Scene Prompt", prompt: "The lead hides the truth. The second character notices, but chooses not to say it yet. MIRA (quietly): I never told you about that night. ORREN: I know. I've always known." })
  const camera = makeNode("camera", "cameraConfig", 760, 510, { label: "Blocking Camera", camera: { ...defaultCamera, focalLength: "50", movement: "subtle handheld" } })
  const video = makeNode("video", "videoOutput", 1120, 300, { label: "Dialogue Clip" })
  const preview = makeNode("preview", "preview", 1480, 300, { label: "Scene Preview" })
  const nodes = [style, characterA, characterB, prompt, camera, video, preview]
  const edges = [edge(style, prompt), edge(characterA, prompt), edge(characterB, prompt), edge(prompt, video), edge(camera, video), edge(video, preview)]
  return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.68 } }
}

/**
 * Short Film Structure: a 5-shot short designed for 30s–2min runtimes.
 * Cold Open → Title Card → Beat 1 → Beat 2 → Beat 3 → Tag.
 * All shots share one style + one character; each gets its own prompt + camera + image output.
 * The preview node collects them in Y-axis order (top → bottom = shot 1 → shot 5).
 */
function buildShortFilmStructure(makeNode: ReturnType<typeof createNodeFactory>, context: WorkflowTemplateContext, edgeFn: (a: WorkspaceNode, b: WorkspaceNode) => WorkspaceEdge) {
  const styleCardId = context.styleCards[0]?.id
  const characterId = context.characters[0]?.id
  const actionCardId = context.actionCards[0]?.id

  const style = makeNode("style", "styleCard", 40, 80, { label: "Film Look", styleCardId })
  const character = makeNode("character", "character", 40, 300, { label: "Protagonist", characterId })
  const action = makeNode("action", "actionCard", 40, 520, { label: "Core Beat", actionCardId })

  type ShotSpec = {
    key: string
    label: string
    prompt: string
    focal: string
    movement: string
    y: number
  }
  const shots: ShotSpec[] = [
    {
      key: "cold-open",
      label: "Shot 01 Cold Open",
      prompt: "A wide static frame holds on the empty aftermath — broken glass, a single chair overturned, light shifting across the floor.",
      focal: "24",
      movement: "locked-off",
      y: 40
    },
    {
      key: "title-card",
      label: "Shot 02 Title Frame",
      prompt: "Hard cut to a black frame with the film title set in clean serif type, faint film grain, slow fade-in over 1.5s.",
      focal: "50",
      movement: "locked-off",
      y: 240
    },
    {
      key: "beat-1",
      label: "Shot 03 Beat 1",
      prompt: "Medium shot: the protagonist enters frame, glances down at the aftermath, and reaches for the overturned chair.",
      focal: "35",
      movement: "slow push-in",
      y: 440
    },
    {
      key: "beat-2",
      label: "Shot 04 Beat 2",
      prompt: "Close-up: hands grip the chair back, knuckles tightening — the protagonist makes a decision without ever looking up.",
      focal: "85",
      movement: "subtle handheld",
      y: 640
    },
    {
      key: "tag",
      label: "Shot 05 Tag",
      prompt: "Wide pull-back: the protagonist leaves frame the way they came. The chair is upright again. Hold for a beat before cutting to black.",
      focal: "24",
      movement: "slow pull-out",
      y: 840
    }
  ]

  const shotNodes = shots.map((spec) => {
    const prompt = makeNode(`prompt-${spec.key}`, "prompt", 420, spec.y, { label: `${spec.label} Prompt`, prompt: spec.prompt })
    const camera = makeNode(`camera-${spec.key}`, "cameraConfig", 760, spec.y, {
      label: `${spec.label} Camera`,
      camera: { ...defaultCamera, focalLength: spec.focal, movement: spec.movement }
    })
    const image = makeNode(`image-${spec.key}`, "imageOutput", 1100, spec.y, { label: `${spec.label} Frame` })
    return { spec, prompt, camera, image }
  })

  const preview = makeNode("preview", "preview", 1460, 440, { label: "Short Film Preview" })

  const nodes = [style, character, action, ...shotNodes.flatMap((s) => [s.prompt, s.camera, s.image]), preview]
  const edges: WorkspaceEdge[] = []
  for (const s of shotNodes) {
    edges.push(edgeFn(style, s.prompt))
    edges.push(edgeFn(character, s.prompt))
    edges.push(edgeFn(action, s.prompt))
    edges.push(edgeFn(s.prompt, s.image))
    edges.push(edgeFn(s.camera, s.image))
    edges.push(edgeFn(s.image, preview))
  }

  return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.5 } }
}

/**
 * Interview + B-roll: a 4-shot pattern common in documentary shorts.
 * One locked-off interview shot of the subject + three B-roll prompts that share
 * the same style + subject. Outputs feed a preview in interview-first order.
 */
function buildInterviewWithBroll(makeNode: ReturnType<typeof createNodeFactory>, context: WorkflowTemplateContext, edgeFn: (a: WorkspaceNode, b: WorkspaceNode) => WorkspaceEdge) {
  const styleCardId = context.styleCards[0]?.id
  const characterId = context.characters[0]?.id

  const style = makeNode("style", "styleCard", 40, 80, { label: "Doc Look", styleCardId })
  const subject = makeNode("subject", "character", 40, 320, { label: "Subject", characterId })
  const script = makeNode("script", "script", 40, 540, { label: "Interview Script", script: "Subject describes the moment they realized what was really at stake — slow, reflective, in their own words." })

  const interviewPrompt = makeNode("prompt-interview", "prompt", 420, 80, {
    label: "Interview Shot Prompt",
    prompt: "Locked-off medium close-up of the subject in soft window light, eye-line just off camera, naturalistic audio, shallow depth of field."
  })
  const interviewCamera = makeNode("camera-interview", "cameraConfig", 760, 80, {
    label: "Interview Camera",
    camera: { ...defaultCamera, body: "handheld-doc", lens: "macro-prime", focalLength: "85", movement: "locked-off" }
  })
  const interviewImage = makeNode("image-interview", "imageOutput", 1100, 80, { label: "Interview Frame" })

  const brollSpecs = [
    { key: "broll-1", label: "B-roll Hands", prompt: "Tight insert on the subject's hands as they gesture while remembering the event.", focal: "85", y: 280 },
    { key: "broll-2", label: "B-roll Location", prompt: "Wide of the location where the event took place — empty now, but the room still holds the memory.", focal: "24", y: 480 },
    { key: "broll-3", label: "B-roll Object", prompt: "Close insert of the object the subject keeps returning to during the interview — a worn photograph, a key, a letter.", focal: "50", y: 680 }
  ]
  const brollNodes = brollSpecs.map((spec) => {
    const prompt = makeNode(`prompt-${spec.key}`, "prompt", 420, spec.y, { label: `${spec.label} Prompt`, prompt: spec.prompt })
    const camera = makeNode(`camera-${spec.key}`, "cameraConfig", 760, spec.y, {
      label: `${spec.label} Camera`,
      camera: { ...defaultCamera, body: "handheld-doc", focalLength: spec.focal, movement: "subtle handheld" }
    })
    const image = makeNode(`image-${spec.key}`, "imageOutput", 1100, spec.y, { label: `${spec.label} Frame` })
    return { spec, prompt, camera, image }
  })

  const preview = makeNode("preview", "preview", 1460, 380, { label: "Doc Sequence Preview" })

  const nodes = [style, subject, script, interviewPrompt, interviewCamera, interviewImage, ...brollNodes.flatMap((b) => [b.prompt, b.camera, b.image]), preview]
  const edges = [
    edgeFn(style, interviewPrompt),
    edgeFn(subject, interviewPrompt),
    edgeFn(script, interviewPrompt),
    edgeFn(interviewPrompt, interviewImage),
    edgeFn(interviewCamera, interviewImage),
    edgeFn(interviewImage, preview)
  ]
  for (const b of brollNodes) {
    edges.push(edgeFn(style, b.prompt))
    edges.push(edgeFn(subject, b.prompt))
    edges.push(edgeFn(b.prompt, b.image))
    edges.push(edgeFn(b.camera, b.image))
    edges.push(edgeFn(b.image, preview))
  }
  return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.55 } }
}

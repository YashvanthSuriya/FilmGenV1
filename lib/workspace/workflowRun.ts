import type { ActionCard, Character, ProjectAsset, StyleCard, WorkspaceEdge, WorkspaceNode, WorkspaceNodeType } from "@/lib/types"
import { assemblePromptForNode } from "@/lib/workspace/promptAssembly"

export const workspaceOutputNodeTypes = ["imageOutput", "videoOutput"] as const

export type WorkspaceOutputNodeType = (typeof workspaceOutputNodeTypes)[number]

export interface WorkspaceAnalysisContext {
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  styleCards: StyleCard[]
  characters: Character[]
  actionCards: ActionCard[]
}

export interface WorkspaceOutputAnalysis {
  ok: boolean
  blockers: string[]
  warnings: string[]
  compiledPrompt: string
  upstreamNodes: WorkspaceNode[]
}

function upstreamIds(nodeId: string, edges: WorkspaceEdge[]) {
  const visited = new Set<string>()
  const stack = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source)

  while (stack.length > 0) {
    const id = stack.pop()
    if (!id || visited.has(id)) continue
    visited.add(id)
    edges.filter((edge) => edge.target === id).forEach((edge) => stack.push(edge.source))
  }

  return visited
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
}

function shortHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36).slice(0, 6).padEnd(6, "0")
}

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildMockPoster({
  title,
  subtitle,
  prompt,
  mediaType
}: {
  title: string
  subtitle: string
  prompt: string
  mediaType: WorkspaceOutputNodeType
}) {
  const hash = shortHash(prompt || title)
  const hueA = Number.parseInt(hash.slice(0, 2), 36) % 360
  const hueB = (hueA + 136) % 360
  const hueC = (hueA + 232) % 360
  const promptLine = escapeSvgText((prompt || "Workspace generated mock output").replace(/\s+/g, " ").slice(0, 92))
  const playMark =
    mediaType === "videoOutput"
      ? `<circle cx="900" cy="176" r="54" fill="rgba(0,0,0,0.34)" stroke="rgba(255,255,255,0.42)" stroke-width="2"/><path d="M884 147 L936 176 L884 205 Z" fill="rgba(255,255,255,0.88)"/>`
      : ""
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA}, 86%, 42%)"/>
      <stop offset="46%" stop-color="#07080d"/>
      <stop offset="100%" stop-color="hsl(${hueB}, 92%, 46%)"/>
    </linearGradient>
    <radialGradient id="pulse" cx="70%" cy="26%" r="70%">
      <stop offset="0%" stop-color="hsl(${hueC}, 96%, 68%)" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#pulse)"/>
  <path d="M-60 600 C260 402 420 820 760 462 C976 234 1126 344 1370 126" fill="none" stroke="rgba(0,229,255,0.72)" stroke-width="18"/>
  <path d="M-20 646 C240 450 468 770 770 506 C996 308 1126 416 1356 238" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="5"/>
  <rect x="72" y="72" width="1136" height="576" rx="32" fill="rgba(0,0,0,0.32)" stroke="rgba(255,255,255,0.16)"/>
  ${playMark}
  <text x="112" y="158" fill="#00e5ff" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="4">${subtitle}</text>
  <text x="112" y="256" fill="#ffffff" font-family="Arial, sans-serif" font-size="78" font-weight="800">${escapeSvgText(title)}</text>
  <text x="112" y="332" fill="rgba(255,255,255,0.74)" font-family="Arial, sans-serif" font-size="30">${promptLine}</text>
  <text x="112" y="592" fill="rgba(255,255,255,0.54)" font-family="Arial, sans-serif" font-size="22">Director workspace mock asset - ${new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</text>
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function isWorkspaceOutputNodeType(type: WorkspaceNodeType | undefined): type is WorkspaceOutputNodeType {
  return type === "imageOutput" || type === "videoOutput"
}

export function getUpstreamNodeIds(nodeId: string, edges: WorkspaceEdge[]) {
  return upstreamIds(nodeId, edges)
}

export function getUpstreamNodes(nodeId: string, nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  const ids = upstreamIds(nodeId, edges)
  return nodes.filter((node) => ids.has(node.id))
}

export function getPreviewOutputNodes(previewNodeId: string, nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  const directSources = new Set(edges.filter((edge) => edge.target === previewNodeId).map((edge) => edge.source))
  return nodes.filter((node) => directSources.has(node.id) && isWorkspaceOutputNodeType(node.type))
}

export function analyzeWorkspaceOutput(nodeId: string, context: WorkspaceAnalysisContext): WorkspaceOutputAnalysis {
  const node = context.nodes.find((item) => item.id === nodeId)
  const upstreamNodes = getUpstreamNodes(nodeId, context.nodes, context.edges)
  const connectedNodes = [...upstreamNodes, ...(node ? [node] : [])]
  const blockers: string[] = []
  const warnings: string[] = []

  if (!node || !isWorkspaceOutputNodeType(node.type)) {
    blockers.push("Choose an image or video output node to run.")
  }

  connectedNodes.forEach((item) => {
    if (item.type === "styleCard" && !item.data.styleCardId) {
      blockers.push("A connected Style Card node has no style selected.")
    }
    if (item.type === "character" && !item.data.characterId) {
      blockers.push("A connected Character node has no character selected.")
    }
    if (item.type === "actionCard" && !item.data.actionCardId && context.actionCards.length === 0) {
      blockers.push("A connected Action node needs an action card.")
    }
  })

  if (node?.type === "videoOutput") {
    const directImageInputs = context.edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => context.nodes.find((item) => item.id === edge.source))
      .filter((item): item is WorkspaceNode => item?.type === "imageOutput")
    if (directImageInputs.some((item) => !hasText(item.data.assetId))) {
      blockers.push("Run the connected Image Output first, or disconnect it for prompt-to-video generation.")
    }
  }

  const hasPrompt = connectedNodes.some((item) => item.type === "prompt" && hasText(item.data.prompt))
  const hasScript = connectedNodes.some((item) => item.type === "script" && hasText(item.data.script))
  const hasAction = connectedNodes.some((item) => item.type === "actionCard" && (hasText(item.data.actionCardId) || context.actionCards.length > 0))
  const hasImageSource = connectedNodes.some((item) => item.type === "imageOutput" && (hasText(item.data.assetId) || hasText(item.data.compiledPrompt) || hasText(item.data.output)))
  const hasCamera = connectedNodes.some((item) => item.type === "cameraConfig" && item.data.camera)
  const hasStyle = connectedNodes.some((item) => item.type === "styleCard" && hasText(item.data.styleCardId))
  const hasCharacter = connectedNodes.some((item) => item.type === "character" && hasText(item.data.characterId))

  if (!hasPrompt && !hasScript && !hasAction && !hasImageSource) {
    blockers.push("Connect a Prompt, Script, Action, or generated Image Output before running.")
  }

  if (!hasCamera) warnings.push("No camera node is connected, so framing intent may be weak.")
  if (!hasStyle) warnings.push("No style card is connected.")
  if (!hasCharacter) warnings.push("No character node is connected.")

  const compiledPrompt = assemblePromptForNode(nodeId, {
    nodes: context.nodes,
    edges: context.edges,
    styleCards: context.styleCards,
    characters: context.characters,
    actionCards: context.actionCards
  })

  if (!compiledPrompt.trim()) {
    blockers.push("The assembled prompt is empty.")
  }

  return {
    ok: blockers.length === 0,
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    compiledPrompt,
    upstreamNodes
  }
}

export function createWorkspaceMockAsset({
  node,
  projectId,
  compiledPrompt,
  mediaType
}: {
  node: WorkspaceNode
  projectId: string
  compiledPrompt: string
  mediaType: WorkspaceOutputNodeType
}): ProjectAsset {
  const isVideo = mediaType === "videoOutput"
  const timestamp = new Date().toISOString()
  const cleanLabel = String(node.data.label ?? (isVideo ? "Director Video" : "Director Image")).trim()
  const id = `workspace-${isVideo ? "video" : "image"}-${shortHash(`${projectId}-${node.id}-${timestamp}`)}`
  const poster = buildMockPoster({
    title: cleanLabel || (isVideo ? "Director Video" : "Director Image"),
    subtitle: isVideo ? "MOCK VIDEO OUTPUT" : "MOCK IMAGE OUTPUT",
    prompt: compiledPrompt,
    mediaType
  })

  return {
    id,
    source: "workspace",
    type: isVideo ? "video" : "image",
    name: cleanLabel || (isVideo ? "Director Video" : "Director Image"),
    prompt: compiledPrompt,
    url: isVideo ? undefined : poster,
    thumbnailUrl: poster,
    mimeType: isVideo ? "video/mp4" : "image/svg+xml",
    duration: isVideo ? 8 : 5,
    createdAt: timestamp,
    workspaceNodeId: node.id
  }
}

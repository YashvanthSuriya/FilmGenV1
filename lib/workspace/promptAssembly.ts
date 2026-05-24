import type { CameraConfig, Character, StyleCard, WorkspaceEdge, WorkspaceNode } from "@/lib/types"

export interface PromptAssemblyContext {
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  styleCards: StyleCard[]
  characters: Character[]
}

function upstreamIds(nodeId: string, edges: WorkspaceEdge[]) {
  const visited = new Set<string>()
  const stack = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source)

  while (stack.length > 0) {
    const id = stack.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    edges.filter((edge) => edge.target === id).forEach((edge) => stack.push(edge.source))
  }

  return visited
}

function formatCamera(camera: CameraConfig) {
  return `${camera.lens}, ${camera.movement}, ${camera.angle}, ${camera.aperture}, ${camera.fps}fps`
}

export function assemblePromptForNode(nodeId: string, context: PromptAssemblyContext) {
  const ids = upstreamIds(nodeId, context.edges)
  ids.add(nodeId)

  const connected = context.nodes.filter((node) => ids.has(node.id))
  const parts: string[] = []

  connected.forEach((node) => {
    if (node.type === "styleCard" && node.data.styleCardId) {
      const style = context.styleCards.find((item) => item.id === node.data.styleCardId)
      if (style) parts.push(`Style: ${style.name}. ${style.description}. Mood: ${style.mood}. Palette: ${style.palette.join(", ")}.`)
    }

    if (node.type === "character" && node.data.characterId) {
      const character = context.characters.find((item) => item.id === node.data.characterId)
      if (character) parts.push(`Character: ${character.name}, ${character.role}. ${character.description}.`)
    }

    if (node.type === "cameraConfig" && node.data.camera) {
      parts.push(`Camera: ${formatCamera(node.data.camera)}`)
    }

    if (node.type === "prompt" && node.data.prompt) {
      parts.push(`Prompt: ${node.data.prompt}`)
    }

    if (node.type === "script" && node.data.script) {
      parts.push(`Script: ${node.data.script}`)
    }
  })

  return parts.join("\n")
}

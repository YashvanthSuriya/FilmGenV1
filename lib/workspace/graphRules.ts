import type { WorkspaceEdge, WorkspaceNode, WorkspaceNodeType } from "@/lib/types"

export const nextNodeRules: Record<WorkspaceNodeType, WorkspaceNodeType[]> = {
  styleCard: ["actionCard", "character", "prompt", "cameraConfig", "combiner", "imageOutput", "videoOutput"],
  actionCard: ["cameraConfig", "prompt", "combiner", "imageOutput", "videoOutput"],
  character: ["actionCard", "prompt", "combiner", "imageOutput", "videoOutput"],
  prompt: ["cameraConfig", "combiner", "imageOutput", "videoOutput", "script"],
  cameraConfig: ["combiner", "imageOutput", "videoOutput", "preview"],
  combiner: ["imageOutput", "videoOutput", "preview"],
  script: ["prompt", "combiner", "videoOutput", "preview"],
  imageOutput: ["videoOutput", "preview"],
  videoOutput: ["preview"],
  preview: []
}

export function getSuggestedNextNodeTypes(type: WorkspaceNodeType) {
  return nextNodeRules[type] ?? []
}

export function canConnectNodeTypes(sourceType: WorkspaceNodeType, targetType: WorkspaceNodeType) {
  return getSuggestedNextNodeTypes(sourceType).includes(targetType)
}

export function wouldCreateCycle(sourceId: string, targetId: string, edges: WorkspaceEdge[]) {
  const outgoing = new Map<string, string[]>()
  edges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target])
  })
  outgoing.set(sourceId, [...(outgoing.get(sourceId) ?? []), targetId])

  const visited = new Set<string>()
  const stack = [targetId]

  while (stack.length > 0) {
    const id = stack.pop()!
    if (id === sourceId) return true
    if (visited.has(id)) continue
    visited.add(id)
    stack.push(...(outgoing.get(id) ?? []))
  }

  return false
}

export function validateConnection(sourceId: string | null, targetId: string | null, nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  if (!sourceId || !targetId) return { ok: false, reason: "Choose a source and target node." }
  if (sourceId === targetId) return { ok: false, reason: "A node cannot connect to itself." }
  if (edges.some((edge) => edge.source === sourceId && edge.target === targetId)) {
    return { ok: false, reason: "These nodes are already connected." }
  }

  const source = nodes.find((node) => node.id === sourceId)
  const target = nodes.find((node) => node.id === targetId)
  if (!source?.type || !target?.type) return { ok: false, reason: "Connection endpoint is missing." }

  if (!canConnectNodeTypes(source.type, target.type)) {
    return { ok: false, reason: `${source.data.label ?? source.type} does not feed ${target.data.label ?? target.type}.` }
  }

  if (wouldCreateCycle(sourceId, targetId, edges)) {
    return { ok: false, reason: "That connection would create a cycle." }
  }

  return { ok: true, reason: null }
}

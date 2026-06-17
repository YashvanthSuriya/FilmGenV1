import type { WorkspaceEdge, WorkspaceNode } from "@/lib/types"

/**
 * Compute a stable string signature for the upstream subgraph of a given node.
 *
 * Used as a useMemo dependency so that Image/Video Output nodes only recompute
 * their analysis when THEIR upstream graph changes — not on every global graph
 * edit (e.g. dragging an unrelated node).
 *
 * The signature includes:
 *   - The ID + type + data-fields-that-affect-prompt of every upstream node
 *   - The source+target of every edge in the upstream subgraph
 *
 * If nothing in this node's upstream changed, the signature is identical and
 * useMemo skips the recompute — no re-render, no visual shift.
 */
export function upstreamSignature(
  nodeId: string,
  nodes: WorkspaceNode[],
  edges: WorkspaceEdge[]
): string {
  const upstream = collectUpstream(nodeId, edges, nodes)
  const parts: string[] = []

  for (const node of upstream.nodes) {
    // Only include data fields that affect the compiled prompt.
    // This avoids signature changes when, e.g., status or assetId updates.
    const promptRelevant = [
      node.type,
      node.data.styleCardId,
      node.data.characterId,
      node.data.actionCardId,
      node.data.environmentId,
      node.data.prompt,
      node.data.script,
      node.data.variant,
      node.data.camera ? JSON.stringify(node.data.camera) : "",
      (node.data.attachedImageIds ?? []).join(","),
      (node.data.referenceImages ?? []).join(",")
    ].join("|")
    parts.push(`${node.id}:${promptRelevant}`)
  }

  for (const edge of upstream.edges) {
    parts.push(`${edge.source}->${edge.target}`)
  }

  return parts.join("\n")
}

function collectUpstream(
  nodeId: string,
  edges: WorkspaceEdge[],
  nodes: WorkspaceNode[]
): { nodes: WorkspaceNode[]; edges: WorkspaceEdge[] } {
  const visited = new Set<string>()
  const stack = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source)

  while (stack.length > 0) {
    const id = stack.pop()
    if (!id || visited.has(id)) continue
    visited.add(id)
    edges.filter((edge) => edge.target === id).forEach((edge) => stack.push(edge.source))
  }

  const upstreamNodeIds = new Set(visited)
  upstreamNodeIds.add(nodeId) // include the node itself

  const upstreamNodes = nodes.filter((n) => upstreamNodeIds.has(n.id))
  const upstreamEdges = edges.filter(
    (e) => upstreamNodeIds.has(e.source) && upstreamNodeIds.has(e.target)
  )

  return { nodes: upstreamNodes, edges: upstreamEdges }
}

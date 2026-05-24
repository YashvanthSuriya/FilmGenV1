import type { WorkspaceEdge, WorkspaceNode, WorkspaceRunStatus } from "@/lib/types"

export class WorkspaceCycleError extends Error {
  code = "WORKSPACE_CYCLE"

  constructor() {
    super("Workspace graph contains a cycle.")
    this.name = "WorkspaceCycleError"
  }
}

export function topologicalSort(nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const indegree = new Map(nodes.map((node) => [node.id, 0]))
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]))

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    outgoing.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  })

  const ready = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id)
  const order: string[] = []

  while (ready.length > 0) {
    const id = ready.shift()!
    order.push(id)
    outgoing.get(id)?.forEach((target) => {
      const next = (indegree.get(target) ?? 0) - 1
      indegree.set(target, next)
      if (next === 0) ready.push(target)
    })
  }

  if (order.length !== nodes.length) {
    throw new WorkspaceCycleError()
  }

  return order
}

export function getExecutionOrder(nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  const order = topologicalSort(nodes, edges)
  const byId = new Map(nodes.map((node) => [node.id, node]))
  return order.map((id) => byId.get(id)).filter(Boolean) as WorkspaceNode[]
}

export function runWorkspaceMock(nodes: WorkspaceNode[], edges: WorkspaceEdge[]) {
  const orderedNodes = getExecutionOrder(nodes, edges)
  const completed = new Set<string>()
  const nextNodes = nodes.map((node) => ({ ...node, data: { ...node.data, status: "queued" as WorkspaceRunStatus } }))

  orderedNodes.forEach((node) => {
    completed.add(node.id)
    const index = nextNodes.findIndex((item) => item.id === node.id)
    if (index >= 0) {
      nextNodes[index] = {
        ...nextNodes[index],
        data: {
          ...nextNodes[index].data,
          status: "completed",
          output: `${node.data.label ?? node.type} completed locally`
        }
      }
    }
  })

  const nextEdges = edges.map((edge) => ({
    ...edge,
    animated: completed.has(edge.source) && completed.has(edge.target),
    data: {
      ...edge.data,
      status: completed.has(edge.source) && completed.has(edge.target) ? ("generating" as WorkspaceRunStatus) : ("idle" as WorkspaceRunStatus)
    }
  }))

  return { nodes: nextNodes, edges: nextEdges, order: orderedNodes.map((node) => node.id) }
}

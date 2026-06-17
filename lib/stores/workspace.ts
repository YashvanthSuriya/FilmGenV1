import { create } from "zustand"
import type { Viewport } from "@xyflow/react"
import type { WorkspaceEdge, WorkspaceMode, WorkspaceNode, WorkspaceNodeData, WorkspaceNodeType, WorkspaceProjectSlot } from "@/lib/types"

export interface WorkspaceStore {
  workspaceMode: WorkspaceMode
  activeWorkspaceId: string
  workspaces: WorkspaceProjectSlot[]
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  selectedNode: string | null
  inspectedNode: string | null
  viewport: Viewport
  saved: boolean
  lastAutosavedAt: string | null
  setNodes: (nodes: WorkspaceNode[]) => void
  setEdges: (edges: WorkspaceEdge[]) => void
  switchWorkspace: (workspaceId: string) => void
  renameWorkspace: (workspaceId: string, name: string) => void
  clearWorkspace: (workspaceId: string) => void
  addNode: (type: WorkspaceNodeType, position: { x: number; y: number }, data?: WorkspaceNodeData) => WorkspaceNode
  updateNode: (nodeId: string, data: Partial<WorkspaceNodeData>) => void
  deleteNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => void
  /** Duplicate a shot cluster: starting from an output node, copy it + its direct upstream Prompt/Camera/Image Output
   *  (and any other direct upstream nodes), preserving shared upstream Style/Character/Action/Script connections.
   *  The duplicated cluster is offset down-right on the canvas for easy visual identification. */
  duplicateShot: (outputNodeId: string) => void
  selectNode: (nodeId: string | null) => void
  inspectNode: (nodeId: string | null) => void
  setViewport: (viewport: Viewport) => void
  setSaved: (saved: boolean) => void
  setWorkspaceMode: (mode: WorkspaceMode) => void
  /** Set of node IDs that are collapsed (body hidden, only header visible). */
  collapsedNodeIds: Set<string>
  toggleNodeCollapsed: (nodeId: string) => void
  collapseAllNodes: () => void
  expandAllNodes: () => void
}

const sessionStamp = "Session only"

function titleFromType(type: WorkspaceNodeType) {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
}

const demoNodes: WorkspaceNode[] = [
  {
    id: "demo-style",
    type: "styleCard",
    position: { x: 80, y: 80 },
    data: {
      label: "Neon Rain Noir",
      styleCardId: "style-neon-noir",
      status: "idle"
    }
  },
  {
    id: "demo-character",
    type: "character",
    position: { x: 80, y: 330 },
    data: {
      label: "Mira Vale",
      characterId: "character-mira",
      status: "idle"
    }
  },
  {
    id: "demo-action",
    type: "actionCard",
    position: { x: 420, y: 250 },
    data: {
      label: "Market Crossing",
      actionCardId: "action-market-crossing",
      status: "idle"
    }
  },
  {
    id: "demo-prompt",
    type: "prompt",
    position: { x: 740, y: 110 },
    data: {
      label: "Market Reveal Prompt",
      prompt: "Mira crosses a flooded neon market while drones sweep the crowd with cold searchlight.",
      status: "idle"
    }
  },
  {
    id: "demo-camera",
    type: "cameraConfig",
    position: { x: 740, y: 380 },
    data: {
      label: "35mm Dolly",
      camera: {
        body: "full-frame-cine",
        lens: "compact-anamorphic",
        focalLength: "35",
        movement: "dolly",
        angle: "eye-level",
        aperture: "f/2.8",
        fps: 24
      },
      status: "idle"
    }
  },
  {
    id: "demo-image",
    type: "imageOutput",
    position: { x: 1100, y: 160 },
    data: {
      label: "Generated Frame",
      status: "idle"
    }
  },
  {
    id: "demo-video",
    type: "videoOutput",
    position: { x: 1460, y: 160 },
    data: {
      label: "Motion Clip",
      status: "idle"
    }
  },
  {
    id: "demo-preview",
    type: "preview",
    position: { x: 1840, y: 160 },
    data: {
      label: "Sequence Preview",
      output: "Run the image and video output nodes to populate this preview.",
      status: "idle"
    }
  }
]

const demoEdges: WorkspaceEdge[] = [
  { id: "edge-style-prompt", source: "demo-style", target: "demo-prompt", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-character-prompt", source: "demo-character", target: "demo-prompt", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-action-prompt", source: "demo-action", target: "demo-prompt", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-prompt-image", source: "demo-prompt", target: "demo-image", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-camera-image", source: "demo-camera", target: "demo-image", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-image-video", source: "demo-image", target: "demo-video", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-camera-video", source: "demo-camera", target: "demo-video", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-video-preview", source: "demo-video", target: "demo-preview", type: "custom", animated: true, data: { status: "idle" } }
]

function createWorkspaceSlots(): WorkspaceProjectSlot[] {
  return [
    {
      id: "workspace-1",
      name: "Demo Board",
      mode: "director",
      nodes: demoNodes,
      edges: demoEdges,
      viewport: { x: 0, y: 0, zoom: 0.75 },
      lastAutosavedAt: sessionStamp
    },
    {
      id: "workspace-2",
      name: "Scratch",
      mode: "director",
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 0.85 },
      lastAutosavedAt: null
    }
  ]
}

function isLegacyDemoWorkspace(workspace: WorkspaceProjectSlot) {
  const nodeIds = new Set(workspace.nodes.map((node) => node.id))
  return (
    workspace.id === "workspace-1" &&
    workspace.name === "Demo Board" &&
    nodeIds.has("demo-preview") &&
    !nodeIds.has("demo-image") &&
    !nodeIds.has("demo-video") &&
    workspace.nodes.every((node) => node.id.startsWith("demo-"))
  )
}

export function migrateWorkspaceSlots(workspaces: WorkspaceProjectSlot[]) {
  const currentDemo = createWorkspaceSlots()[0]
  return workspaces.map((workspace) => (isLegacyDemoWorkspace(workspace) ? currentDemo : workspace))
}

function updateActiveWorkspace(state: WorkspaceStore, patch: Partial<WorkspaceProjectSlot>) {
  return state.workspaces.map((workspace) => (workspace.id === state.activeWorkspaceId ? { ...workspace, ...patch } : workspace))
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaceMode: "director",
  activeWorkspaceId: "workspace-1",
  workspaces: createWorkspaceSlots(),
  nodes: demoNodes,
  edges: demoEdges,
  selectedNode: "demo-preview",
  inspectedNode: null,
  viewport: { x: 0, y: 0, zoom: 0.75 },
  saved: true,
  lastAutosavedAt: sessionStamp,
  collapsedNodeIds: new Set<string>(),
  toggleNodeCollapsed: (nodeId) =>
    set((state) => {
      const next = new Set(state.collapsedNodeIds)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return { collapsedNodeIds: next }
    }),
  collapseAllNodes: () =>
    set((state) => ({
      collapsedNodeIds: new Set(state.nodes.map((n) => n.id))
    })),
  expandAllNodes: () =>
    set({ collapsedNodeIds: new Set<string>() }),
  setNodes: (nodes) =>
    set((state) => ({ nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: sessionStamp }), saved: true, lastAutosavedAt: sessionStamp })),
  setEdges: (edges) =>
    set((state) => ({ edges, workspaces: updateActiveWorkspace(state, { edges, lastAutosavedAt: sessionStamp }), saved: true, lastAutosavedAt: sessionStamp })),
  switchWorkspace: (workspaceId) =>
    set((state) => {
      const workspace = state.workspaces.find((item) => item.id === workspaceId)
      if (!workspace) return state
      return {
        activeWorkspaceId: workspace.id,
        workspaceMode: "director",
        nodes: workspace.nodes,
        edges: workspace.edges,
        viewport: workspace.viewport,
        selectedNode: null,
        inspectedNode: null,
        lastAutosavedAt: workspace.lastAutosavedAt,
        saved: true
      }
    }),
  renameWorkspace: (workspaceId, name) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => (workspace.id === workspaceId ? { ...workspace, name } : workspace))
    })),
  clearWorkspace: (workspaceId) =>
    set((state) => {
      const nextWorkspaces = state.workspaces.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, lastAutosavedAt: sessionStamp } : workspace
      )
      if (workspaceId !== state.activeWorkspaceId) return { workspaces: nextWorkspaces }
      return { workspaces: nextWorkspaces, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, selectedNode: null, inspectedNode: null, saved: true, lastAutosavedAt: sessionStamp }
    }),
  addNode: (type, position, data = {}) => {
    const node: WorkspaceNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: titleFromType(type),
        status: "idle",
        ...data
      }
    }
    set((state) => {
      const nodes = [...state.nodes, node]
      return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: sessionStamp }), selectedNode: node.id, saved: true, lastAutosavedAt: sessionStamp }
    })
    return node
  },
  updateNode: (nodeId, data) =>
    set((state) => {
      const nodes = state.nodes.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
      return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: sessionStamp }), saved: true, lastAutosavedAt: sessionStamp }
    }),
  deleteNode: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.filter((node) => node.id !== nodeId)
      const edges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      return {
        nodes,
        edges,
        workspaces: updateActiveWorkspace(state, { nodes, edges, lastAutosavedAt: sessionStamp }),
        selectedNode: state.selectedNode === nodeId ? null : state.selectedNode,
        inspectedNode: state.inspectedNode === nodeId ? null : state.inspectedNode,
        saved: true,
        lastAutosavedAt: sessionStamp
      }
    }),
  duplicateNode: (nodeId) =>
    set((state) => {
      const source = state.nodes.find((node) => node.id === nodeId)
      if (!source) return state
      const duplicate: WorkspaceNode = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        selected: false,
        position: { x: source.position.x + 36, y: source.position.y + 36 },
        data: { ...source.data, label: `${source.data.label ?? titleFromType(source.type ?? "prompt")} Copy` }
      }
      const nodes = [...state.nodes, duplicate]
      return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: sessionStamp }), selectedNode: duplicate.id, saved: true, lastAutosavedAt: sessionStamp }
    }),
  duplicateShot: (outputNodeId) =>
    set((state) => {
      const output = state.nodes.find((node) => node.id === outputNodeId)
      if (!output) return state
      // Only meaningful from an output or preview node.
      if (output.type !== "imageOutput" && output.type !== "videoOutput" && output.type !== "preview") return state

      // Cluster = the output node + its DIRECT upstream nodes (Prompt, Camera, Image Output, Action Card,
      // Script, Combiner). Style Card, Character, Action Card and Script nodes are SHARED upstream
      // (they typically represent reusable creative intent) — we re-link to them rather than copy them.
      const directUpstreamEdges = state.edges.filter((edge) => edge.target === outputNodeId)
      const directUpstreamNodes = directUpstreamEdges
        .map((edge) => state.nodes.find((node) => node.id === edge.source))
        .filter((node): node is WorkspaceNode => Boolean(node))

      const stamp = Date.now()
      const offsetX = 60
      const offsetY = 80

      const idMap = new Map<string, string>()
      // Map the output node first
      idMap.set(output.id, `${output.id}-shot-${stamp}`)
      // Map each upstream node that we will duplicate. We duplicate Prompt, Camera, Image Output,
      // Action Card (when used as the shot's beat), Script, Combiner — these represent per-shot intent.
      // We do NOT duplicate Style Card or Character — those are shared.
      const shouldCopy = (node: WorkspaceNode) =>
        node.type === "prompt" ||
        node.type === "cameraConfig" ||
        node.type === "imageOutput" ||
        node.type === "videoOutput" ||
        node.type === "script" ||
        node.type === "combiner" ||
        node.type === "actionCard"

      const nodesToCopy: WorkspaceNode[] = []
      for (const upstream of directUpstreamNodes) {
        if (shouldCopy(upstream) && !idMap.has(upstream.id)) {
          idMap.set(upstream.id, `${upstream.id}-shot-${stamp}`)
          nodesToCopy.push(upstream)
        }
      }

      // Build duplicated nodes
      const duplicatedNodes: WorkspaceNode[] = []
      // The output node itself
      duplicatedNodes.push({
        ...output,
        id: idMap.get(output.id)!,
        selected: false,
        position: { x: output.position.x + offsetX, y: output.position.y + offsetY },
        data: {
          ...output.data,
          label: `${output.data.label ?? "Shot"} Copy`,
          // Reset run state — the duplicate is a fresh shot
          status: "idle",
          assetId: undefined,
          previewUrl: undefined,
          compiledPrompt: undefined,
          output: undefined,
          errorMessage: undefined,
          lastRunAt: undefined
        }
      })
      // Upstream nodes
      for (const node of nodesToCopy) {
        duplicatedNodes.push({
          ...node,
          id: idMap.get(node.id)!,
          selected: false,
          position: { x: node.position.x + offsetX, y: node.position.y + offsetY },
          data: {
            ...node.data,
            label: `${node.data.label ?? titleFromType(node.type ?? "prompt")} Copy`,
            // Reset run state for any output nodes inside the cluster
            ...(node.type === "imageOutput" || node.type === "videoOutput"
              ? { status: "idle" as const, assetId: undefined, previewUrl: undefined, compiledPrompt: undefined, output: undefined, errorMessage: undefined, lastRunAt: undefined }
              : {})
          }
        })
      }

      // Build edges: for every original edge where source OR target was duplicated,
      // create a corresponding edge using the new IDs. Edges to SHARED upstream nodes
      // (Style Card, Character) keep the original source ID but get the new target.
      const duplicatedEdges: WorkspaceEdge[] = []
      for (const edge of directUpstreamEdges) {
        const newTargetId = idMap.get(output.id)!
        const newSourceId = idMap.get(edge.source) ?? edge.source
        duplicatedEdges.push({
          ...edge,
          id: `edge-${newSourceId}-${newTargetId}-${stamp}`,
          source: newSourceId,
          target: newTargetId,
          data: { status: "idle" }
        })
      }

      const nodes = [...state.nodes, ...duplicatedNodes]
      const edges = [...state.edges, ...duplicatedEdges]
      return {
        nodes,
        edges,
        workspaces: updateActiveWorkspace(state, { nodes, edges, lastAutosavedAt: sessionStamp }),
        selectedNode: idMap.get(output.id)!,
        saved: true,
        lastAutosavedAt: sessionStamp
      }
    }),
  selectNode: (selectedNode) => set({ selectedNode }),
  inspectNode: (inspectedNode) => set({ inspectedNode }),
  setViewport: (viewport) => set((state) => ({ viewport, workspaces: updateActiveWorkspace(state, { viewport }) })),
  setSaved: (saved) => set({ saved, lastAutosavedAt: saved ? sessionStamp : null })
  ,
  setWorkspaceMode: (workspaceMode) => set((state) => ({
    workspaceMode,
    workspaces: state.workspaces.map((workspace) => (workspace.id === state.activeWorkspaceId ? { ...workspace, mode: workspaceMode } : workspace))
  }))
}))

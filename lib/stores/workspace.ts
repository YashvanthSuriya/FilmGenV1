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
  selectNode: (nodeId: string | null) => void
  inspectNode: (nodeId: string | null) => void
  setViewport: (viewport: Viewport) => void
  setSaved: (saved: boolean) => void
  setWorkspaceMode: (mode: WorkspaceMode) => void
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
        lens: "35mm",
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

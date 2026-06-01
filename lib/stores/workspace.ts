import { create } from "zustand"
import type { Viewport } from "@xyflow/react"
import type { AmateurWorkflowState, WorkspaceEdge, WorkspaceMode, WorkspaceNode, WorkspaceNodeData, WorkspaceNodeType, WorkspaceProjectSlot } from "@/lib/types"

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
  setAmateurWorkflow: (patch: Partial<AmateurWorkflowState>) => void
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
    id: "demo-prompt",
    type: "prompt",
    position: { x: 500, y: 120 },
    data: {
      label: "Market Reveal Prompt",
      prompt: "Mira crosses a flooded neon market while drones sweep the crowd with cold searchlight.",
      status: "idle"
    }
  },
  {
    id: "demo-camera",
    type: "cameraConfig",
    position: { x: 500, y: 380 },
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
    id: "demo-preview",
    type: "preview",
    position: { x: 920, y: 190 },
    data: {
      label: "Shot Preview",
      previewUrl: "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(7,8,13,0.96) 46%, rgba(255,184,0,0.16))",
      output: "Static demo frame",
      status: "idle"
    }
  }
]

const demoEdges: WorkspaceEdge[] = [
  { id: "edge-style-prompt", source: "demo-style", target: "demo-prompt", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-character-prompt", source: "demo-character", target: "demo-prompt", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-prompt-preview", source: "demo-prompt", target: "demo-preview", type: "custom", animated: true, data: { status: "idle" } },
  { id: "edge-camera-preview", source: "demo-camera", target: "demo-preview", type: "custom", animated: true, data: { status: "idle" } }
]

function createWorkspaceSlots(): WorkspaceProjectSlot[] {
  return [
    {
      id: "workspace-1",
      name: "Demo Board",
      mode: "director",
      amateur: undefined,
      nodes: demoNodes,
      edges: demoEdges,
      viewport: { x: 0, y: 0, zoom: 0.75 },
      lastAutosavedAt: sessionStamp
    },
    {
      id: "workspace-2",
      name: "Scratch",
      mode: "director",
      amateur: undefined,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 0.85 },
      lastAutosavedAt: null
    }
  ]
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
  })),
  setAmateurWorkflow: (patch) => set((state) => {
    const active = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId)
    const amateur = { ...active?.amateur, ...patch } as AmateurWorkflowState
    return {
      workspaces: state.workspaces.map((workspace) => (workspace.id === state.activeWorkspaceId ? { ...workspace, amateur, lastAutosavedAt: sessionStamp } : workspace)),
      saved: true,
      lastAutosavedAt: sessionStamp
    }
  })
}))

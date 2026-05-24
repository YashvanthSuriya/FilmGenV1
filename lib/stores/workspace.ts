import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Viewport } from "@xyflow/react"
import type { WorkspaceEdge, WorkspaceNode, WorkspaceNodeData, WorkspaceNodeType, WorkspaceProjectSlot } from "@/lib/types"

export interface WorkspaceStore {
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
}

function titleFromType(type: WorkspaceNodeType) {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
}

function markSaved() {
  return { saved: true, lastAutosavedAt: new Date().toISOString() }
}

function createWorkspaceSlots(): WorkspaceProjectSlot[] {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `workspace-${index + 1}`,
    name: `Workspace ${index + 1}`,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 0.85 },
    lastAutosavedAt: null
  }))
}

function normalizeWorkspaceSlot(slot: Partial<WorkspaceProjectSlot> | undefined, fallback: WorkspaceProjectSlot): WorkspaceProjectSlot {
  return {
    ...fallback,
    ...(slot ?? {}),
    id: slot?.id ?? fallback.id,
    name: slot?.name ?? fallback.name,
    nodes: Array.isArray(slot?.nodes) ? slot.nodes : fallback.nodes,
    edges: Array.isArray(slot?.edges) ? slot.edges : fallback.edges,
    viewport: slot?.viewport ?? fallback.viewport,
    lastAutosavedAt: slot?.lastAutosavedAt ?? fallback.lastAutosavedAt
  }
}

function updateActiveWorkspace(state: WorkspaceStore, patch: Partial<WorkspaceProjectSlot>) {
  return state.workspaces.map((workspace) => (workspace.id === state.activeWorkspaceId ? { ...workspace, ...patch } : workspace))
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspaceId: "workspace-1",
      workspaces: createWorkspaceSlots(),
      nodes: [],
      edges: [],
      selectedNode: null,
      inspectedNode: null,
      viewport: { x: 0, y: 0, zoom: 0.85 },
      saved: true,
      lastAutosavedAt: null,
      setNodes: (nodes) =>
        set((state) => {
          const saved = markSaved()
          return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: saved.lastAutosavedAt }), ...saved }
        }),
      setEdges: (edges) =>
        set((state) => {
          const saved = markSaved()
          return { edges, workspaces: updateActiveWorkspace(state, { edges, lastAutosavedAt: saved.lastAutosavedAt }), ...saved }
        }),
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
            workspace.id === workspaceId ? { ...workspace, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, lastAutosavedAt: new Date().toISOString() } : workspace
          )
          if (workspaceId !== state.activeWorkspaceId) return { workspaces: nextWorkspaces }
          return { workspaces: nextWorkspaces, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, selectedNode: null, inspectedNode: null, ...markSaved() }
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
          const saved = markSaved()
          return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: saved.lastAutosavedAt }), selectedNode: node.id, ...saved }
        })
        return node
      },
      updateNode: (nodeId, data) =>
        set((state) => {
          const nodes = state.nodes.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
          const saved = markSaved()
          return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: saved.lastAutosavedAt }), ...saved }
        }),
      deleteNode: (nodeId) =>
        set((state) => {
          const nodes = state.nodes.filter((node) => node.id !== nodeId)
          const edges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
          const saved = markSaved()
          return {
            nodes,
            edges,
            workspaces: updateActiveWorkspace(state, { nodes, edges, lastAutosavedAt: saved.lastAutosavedAt }),
            selectedNode: state.selectedNode === nodeId ? null : state.selectedNode,
            inspectedNode: state.inspectedNode === nodeId ? null : state.inspectedNode,
            ...saved
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
          const saved = markSaved()
          return { nodes, workspaces: updateActiveWorkspace(state, { nodes, lastAutosavedAt: saved.lastAutosavedAt }), selectedNode: duplicate.id, ...saved }
        }),
      selectNode: (selectedNode) => set({ selectedNode }),
      inspectNode: (inspectedNode) => set({ inspectedNode }),
      setViewport: (viewport) => set((state) => ({ viewport, workspaces: updateActiveWorkspace(state, { viewport }) })),
      setSaved: (saved) => set({ saved, lastAutosavedAt: saved ? new Date().toISOString() : null })
    }),
    {
      name: "cine-studio-workspace",
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<WorkspaceStore>
        const defaultSlots = createWorkspaceSlots()
        const legacyFirstSlot = {
          ...defaultSlots[0],
          nodes: Array.isArray(saved.nodes) ? saved.nodes : [],
          edges: Array.isArray(saved.edges) ? saved.edges : [],
          viewport: saved.viewport ?? defaultSlots[0].viewport,
          lastAutosavedAt: saved.lastAutosavedAt ?? null
        }
        const workspaces = Array.isArray(saved.workspaces) && saved.workspaces.length > 0
          ? defaultSlots.map((slot, index) => normalizeWorkspaceSlot(saved.workspaces?.[index], slot))
          : [legacyFirstSlot, ...defaultSlots.slice(1)]
        const activeWorkspaceId = saved.activeWorkspaceId ?? "workspace-1"
        const active = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0]
        return {
          ...current,
          ...saved,
          workspaces,
          activeWorkspaceId: active.id,
          nodes: active.nodes,
          edges: active.edges,
          viewport: active.viewport,
          selectedNode: null,
          inspectedNode: null,
          lastAutosavedAt: active.lastAutosavedAt
        } as WorkspaceStore
      },
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        workspaces: state.workspaces,
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
        saved: state.saved,
        lastAutosavedAt: state.lastAutosavedAt
      })
    }
  )
)

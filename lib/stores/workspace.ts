import { create } from "zustand"
import type { WorkspaceEdge, WorkspaceNode } from "@/lib/types"

export interface WorkspaceStore {
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
  selectedNode: string | null
  viewport: { x: number; y: number; zoom: number }
  selectNode: (nodeId: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  selectNode: (selectedNode) => set({ selectedNode })
}))

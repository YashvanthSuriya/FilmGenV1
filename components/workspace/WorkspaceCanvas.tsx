"use client"

import { useCallback, useMemo, useState } from "react"
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type EdgeMouseHandler,
  type NodeChange
} from "@xyflow/react"
import { Check, Copy, Crosshair, Eraser, LayoutTemplate, Link2Off, MousePointer2, Pin, Trash2, type LucideIcon } from "lucide-react"
import { CustomEdge } from "@/components/workspace/CustomEdge"
import { NodePalette, workspaceTools } from "@/components/workspace/NodePalette"
import { PropertiesPanel } from "@/components/workspace/PropertiesPanel"
import { ActionCardNode } from "@/components/workspace/nodes/ActionCardNode"
import { CameraConfigNode } from "@/components/workspace/nodes/CameraConfigNode"
import { CharacterNode } from "@/components/workspace/nodes/CharacterNode"
import { CombinerNode } from "@/components/workspace/nodes/CombinerNode"
import { ImageOutputNode } from "@/components/workspace/nodes/ImageOutputNode"
import { PreviewNode } from "@/components/workspace/nodes/PreviewNode"
import { PromptNode } from "@/components/workspace/nodes/PromptNode"
import { ScriptNode } from "@/components/workspace/nodes/ScriptNode"
import { StyleCardNode } from "@/components/workspace/nodes/StyleCardNode"
import { VideoOutputNode } from "@/components/workspace/nodes/VideoOutputNode"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { WorkspaceEdge, WorkspaceNode, WorkspaceNodeType } from "@/lib/types"
import { getSuggestedNextNodeTypes, validateConnection } from "@/lib/workspace/graphRules"
import { buildWorkflowTemplate, workflowTemplates, type WorkflowTemplateId } from "@/lib/workspace/workflowTemplates"

const nodeTypes = {
  styleCard: StyleCardNode,
  actionCard: ActionCardNode,
  character: CharacterNode,
  prompt: PromptNode,
  cameraConfig: CameraConfigNode,
  imageOutput: ImageOutputNode,
  videoOutput: VideoOutputNode,
  combiner: CombinerNode,
  script: ScriptNode,
  preview: PreviewNode
}

const edgeTypes = {
  custom: CustomEdge
}

type ContextMenuState =
  | { kind: "canvas"; x: number; y: number }
  | { kind: "node"; x: number; y: number; nodeId: string }
  | { kind: "edge"; x: number; y: number; edgeId: string }
  | null

function clampMenuPosition(x: number, y: number, width = 224, height = 360) {
  const margin = 12
  return {
    x: Math.min(Math.max(margin, x), window.innerWidth - width - margin),
    y: Math.min(Math.max(margin, y), window.innerHeight - height - margin)
  }
}

export function WorkspaceCanvas() {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvasInner />
    </ReactFlowProvider>
  )
}

function WorkspaceCanvasInner() {
  const { fitView, screenToFlowPosition } = useReactFlow<WorkspaceNode, WorkspaceEdge>()
  const nodes = useWorkspaceStore((state) => state.nodes)
  const edges = useWorkspaceStore((state) => state.edges)
  const selectedNodeId = useWorkspaceStore((state) => state.selectedNode)
  const viewport = useWorkspaceStore((state) => state.viewport)
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const saved = useWorkspaceStore((state) => state.saved)
  const lastAutosavedAt = useWorkspaceStore((state) => state.lastAutosavedAt)
  const setNodes = useWorkspaceStore((state) => state.setNodes)
  const setEdges = useWorkspaceStore((state) => state.setEdges)
  const addNode = useWorkspaceStore((state) => state.addNode)
  const updateNode = useWorkspaceStore((state) => state.updateNode)
  const deleteNode = useWorkspaceStore((state) => state.deleteNode)
  const duplicateNode = useWorkspaceStore((state) => state.duplicateNode)
  const selectNode = useWorkspaceStore((state) => state.selectNode)
  const setViewport = useWorkspaceStore((state) => state.setViewport)
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace)
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace)
  const styleCards = useProjectStore((state) => state.styleCards)
  const characters = useProjectStore((state) => state.characters)
  const actionCards = useProjectStore((state) => state.actionCards)
  const [menu, setMenu] = useState<ContextMenuState>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [hideSuggestionsForNode, setHideSuggestionsForNode] = useState<string | null>(null)
  const [expandedSuggestionsForNode, setExpandedSuggestionsForNode] = useState<string | null>(null)
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false)
  const lastSavedLabel = useMemo(() => {
    if (!lastAutosavedAt) return "Session edits are not persisted"
    if (lastAutosavedAt === "Session only") return lastAutosavedAt
    return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(lastAutosavedAt))
  }, [lastAutosavedAt])

  const createNode = useCallback(
    (type: WorkspaceNodeType, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) => {
      const position = screenToFlowPosition({ x: clientX, y: clientY })
      addNode(type, position)
      setMenu(null)
    },
    [addNode, screenToFlowPosition]
  )

  const createConnectedNode = useCallback(
    (sourceNode: WorkspaceNode, type: WorkspaceNodeType) => {
      const node = addNode(type, { x: sourceNode.position.x + 460, y: sourceNode.position.y + 12 })
      setEdges([
        ...edges,
        {
          id: `edge-${sourceNode.id}-${node.id}-${Date.now()}`,
          source: sourceNode.id,
          target: node.id,
          type: "custom",
          animated: true,
          data: { status: "idle" }
        }
      ])
      setConnectionError(null)
      setMenu(null)
      setHideSuggestionsForNode(node.id)
      setExpandedSuggestionsForNode(null)
    },
    [addNode, edges, setEdges]
  )

  const onNodesChange = useCallback((changes: NodeChange<WorkspaceNode>[]) => setNodes(applyNodeChanges(changes, nodes)), [nodes, setNodes])
  const onEdgesChange = useCallback((changes: EdgeChange<WorkspaceEdge>[]) => setEdges(applyEdgeChanges(changes, edges)), [edges, setEdges])
  const onConnect = useCallback(
    (connection: Connection) => {
      const validation = validateConnection(connection.source, connection.target, nodes, edges)
      if (!validation.ok) {
        setConnectionError(validation.reason)
        return
      }
      setConnectionError(null)
      setEdges(
        addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            type: "custom",
            animated: true,
            data: { status: "idle" }
          },
          edges
        )
      )
    },
    [edges, nodes, setEdges]
  )

  const onEdgeContextMenu: EdgeMouseHandler<WorkspaceEdge> = useCallback(
    (event, edge) => {
      event.preventDefault()
      const position = clampMenuPosition(event.clientX, event.clientY, 224, 160)
      setMenu({ kind: "edge", x: position.x, y: position.y, edgeId: edge.id })
    },
    []
  )

  function selectAll() {
    setNodes(nodes.map((node) => ({ ...node, selected: true })))
    setMenu(null)
  }

  function duplicateSelected(nodeId: string) {
    duplicateNode(nodeId)
    setMenu(null)
  }

  function deleteSelected(nodeId: string) {
    deleteNode(nodeId)
    setMenu(null)
  }

  function disconnectEdge(edgeId: string) {
    setEdges(edges.filter((edge) => edge.id !== edgeId))
    setMenu(null)
  }

  function pinNode(nodeId: string) {
    const node = nodes.find((item) => item.id === nodeId)
    updateNode(nodeId, { pinned: !node?.data.pinned })
    setMenu(null)
  }

  function applyTemplate(templateId: WorkflowTemplateId) {
    if (nodes.length > 0 && !window.confirm("Replace the current workspace with this starter workflow?")) return
    const template = buildWorkflowTemplate(templateId, { styleCards, characters, actionCards })
    setNodes(template.nodes)
    setEdges(template.edges)
    setViewport(template.viewport)
    selectNode(template.nodes[0]?.id ?? null)
    setTemplateMenuOpen(false)
    setConnectionError(null)
    window.setTimeout(() => fitView({ padding: 0.25, maxZoom: 0.85 }), 0)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-background">
      <NodePalette onAddNode={(type) => createNode(type)} />
      <main className="relative min-w-0 flex-1">
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface/95 p-2 shadow-md">
          <span className="h-9 rounded-full border border-border-subtle bg-background/80 px-3 pt-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-cyan shadow-md backdrop-blur">
            Director Workspace
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTemplateMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded px-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary hover:bg-elevated hover:text-accent-cyan"
              aria-expanded={templateMenuOpen}
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </button>
            {templateMenuOpen ? (
              <div className="absolute left-0 top-11 w-72 rounded-[var(--radius-md)] border border-border bg-overlay p-2 text-sm text-text-secondary shadow-lg">
                {workflowTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left transition hover:bg-elevated hover:text-text-primary"
                  >
                    <span className="block font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan">{template.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-text-muted">{template.description}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" onClick={() => fitView({ padding: 0.2 })} className="grid h-9 w-9 place-items-center rounded text-text-secondary hover:bg-elevated hover:text-accent-cyan" aria-label="Fit view">
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute left-4 top-20 z-20 flex max-w-[calc(100%-390px)] items-center gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-border-subtle bg-surface/95 p-1.5 shadow-md">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => switchWorkspace(workspace.id)}
              className={`h-8 shrink-0 rounded px-3 font-heading text-[10px] uppercase tracking-[0.08em] ${activeWorkspaceId === workspace.id ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:bg-elevated hover:text-text-primary"}`}
            >
              {workspace.name}
              <span className="ml-2 text-text-muted">{workspace.nodes.length}</span>
            </button>
          ))}
          <button type="button" onClick={() => clearWorkspace(activeWorkspaceId)} className="grid h-8 w-8 shrink-0 place-items-center rounded text-text-muted hover:bg-accent-red-dim hover:text-accent-red" aria-label="Clear active workspace">
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            selectNode(node.id)
            setConnectionError(null)
            setHideSuggestionsForNode(null)
            setExpandedSuggestionsForNode(null)
          }}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={() => {
            selectNode(null)
            setMenu(null)
            setConnectionError(null)
            setHideSuggestionsForNode(null)
            setExpandedSuggestionsForNode(null)
          }}
          onMoveEnd={(_, viewport) => setViewport(viewport)}
          onPaneContextMenu={(event) => {
            event.preventDefault()
            const position = clampMenuPosition(event.clientX, event.clientY, 224, 430)
            setMenu({ kind: "canvas", x: position.x, y: position.y })
          }}
          onNodeContextMenu={(event, node) => {
            event.preventDefault()
            selectNode(node.id)
            const position = clampMenuPosition(event.clientX, event.clientY, 224, 180)
            setMenu({ kind: "node", x: position.x, y: position.y, nodeId: node.id })
          }}
          isValidConnection={(connection) => validateConnection(connection.source, connection.target, nodes, edges).ok}
          deleteKeyCode={["Backspace", "Delete"]}
          defaultViewport={viewport}
          fitView={nodes.length > 0}
          fitViewOptions={{ padding: 0.35, maxZoom: 0.9 }}
          minZoom={0.2}
          maxZoom={1.4}
          className="workspace-flow"
          defaultEdgeOptions={{ type: "custom", animated: true, data: { status: "idle" } }}
        >
          <Background color="rgba(255,255,255,0.08)" gap={24} />
          <Controls className="!border-border-subtle !bg-surface !shadow-md" />
          <MiniMap nodeColor="#00E5FF" maskColor="rgba(8,8,8,0.72)" className="!border !border-border-subtle !bg-surface" />
        </ReactFlow>

        {connectionError ? <ConnectionNotice message={connectionError} onClose={() => setConnectionError(null)} /> : null}
        <NextNodeSuggestions
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          hiddenNodeId={hideSuggestionsForNode}
          expandedNodeId={expandedSuggestionsForNode}
          onToggle={(nodeId) => setExpandedSuggestionsForNode((current) => (current === nodeId ? null : nodeId))}
          onAdd={createConnectedNode}
        />
        <StatusBar nodeCount={nodes.length} edgeCount={edges.length} saved={saved} lastSaved={lastSavedLabel} />
        <ContextMenu menu={menu} onAddNode={createNode} onFitView={() => fitView({ padding: 0.2 })} onSelectAll={selectAll} onDuplicate={duplicateSelected} onDelete={deleteSelected} onPin={pinNode} onDisconnect={disconnectEdge} />
        <PropertiesPanel />
      </main>
    </div>
  )
}

function ConnectionNotice({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute left-1/2 top-4 z-30 max-w-md -translate-x-1/2 rounded-[var(--radius-md)] border border-accent-amber bg-overlay px-4 py-2 text-sm text-accent-amber shadow-lg"
    >
      {message}
    </button>
  )
}

function NextNodeSuggestions({
  nodes,
  selectedNodeId,
  hiddenNodeId,
  expandedNodeId,
  onToggle,
  onAdd
}: {
  nodes: WorkspaceNode[]
  selectedNodeId: string | null
  hiddenNodeId: string | null
  expandedNodeId: string | null
  onToggle: (nodeId: string) => void
  onAdd: (sourceNode: WorkspaceNode, type: WorkspaceNodeType) => void
}) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  const suggestions = selectedNode?.type ? getSuggestedNextNodeTypes(selectedNode.type) : []

  if (!selectedNode || selectedNode.id === hiddenNodeId || suggestions.length === 0) return null
  const expanded = expandedNodeId === selectedNode.id

  return (
    <div className="absolute left-4 top-20 z-20 max-w-[calc(100%-360px)] rounded-[var(--radius-md)] border border-border-subtle bg-surface/90 p-1.5 shadow-md backdrop-blur max-lg:left-3 max-lg:top-28 max-lg:max-w-[190px]">
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onToggle(selectedNode.id)
        }}
        className="flex h-8 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-xs text-text-secondary transition hover:bg-elevated hover:text-accent-cyan"
      >
        <span className="font-heading font-semibold uppercase tracking-[0.08em]">Next</span>
        <span className="truncate text-text-muted">{suggestions.length}</span>
      </button>
      {expanded ? (
        <div className="mt-1 flex max-w-full flex-wrap gap-1.5">
        {suggestions.map((type) => {
          const tool = workspaceTools.find((item) => item.type === type)
          if (!tool) return null
          const Icon = tool.icon
          return (
            <button
              key={type}
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onAdd(selectedNode, type)
              }}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border-subtle bg-background px-2 text-left text-xs text-text-secondary transition hover:border-accent-cyan hover:bg-accent-cyan-dim hover:text-accent-cyan"
            >
              <Icon className="h-4 w-4" />
              {tool.label}
            </button>
          )
        })}
        </div>
      ) : null}
    </div>
  )
}

function StatusBar({ nodeCount, edgeCount, saved, lastSaved }: { nodeCount: number; edgeCount: number; saved: boolean; lastSaved: string }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center gap-5 rounded-[var(--radius-md)] border border-border-subtle bg-surface/95 px-5 text-sm text-text-secondary shadow-md">
      <span>{nodeCount} nodes</span>
      <span>{edgeCount} edges</span>
      <span className="flex items-center gap-2 text-accent-green">
        <Check className="h-4 w-4" />
        {saved ? "Saved" : "Saving"}
      </span>
      <span>{lastSaved}</span>
    </div>
  )
}

function ContextMenu({
  menu,
  onAddNode,
  onFitView,
  onSelectAll,
  onDuplicate,
  onDelete,
  onPin,
  onDisconnect
}: {
  menu: ContextMenuState
  onAddNode: (type: WorkspaceNodeType, x?: number, y?: number) => void
  onFitView: () => void
  onSelectAll: () => void
  onDuplicate: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onPin: (nodeId: string) => void
  onDisconnect: (edgeId: string) => void
}) {
  if (!menu) return null

  return (
    <div className="fixed z-50 min-w-52 rounded-[var(--radius-md)] border border-border bg-overlay p-1 text-sm text-text-secondary shadow-lg" style={{ left: menu.x, top: menu.y }}>
      {menu.kind === "canvas" ? (
        <>
          <div className="px-3 py-2 font-heading text-xs uppercase text-text-muted">Add Node</div>
          {workspaceTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button key={tool.type} type="button" onClick={() => onAddNode(tool.type, menu.x, menu.y)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-elevated hover:text-text-primary">
                <Icon className="h-4 w-4" />
                {tool.label}
              </button>
            )
          })}
          <MenuButton icon={Crosshair} label="Fit View" onClick={onFitView} />
          <MenuButton icon={MousePointer2} label="Select All" onClick={onSelectAll} />
        </>
      ) : menu.kind === "node" ? (
        <>
          <MenuButton icon={Copy} label="Duplicate" onClick={() => onDuplicate(menu.nodeId)} />
          <MenuButton icon={Trash2} label="Delete" onClick={() => onDelete(menu.nodeId)} />
          <MenuButton icon={Pin} label="Pin" onClick={() => onPin(menu.nodeId)} />
        </>
      ) : (
        <>
          <MenuButton icon={Link2Off} label="Disconnect" onClick={() => onDisconnect(menu.edgeId)} />
          <MenuButton icon={Trash2} label="Delete Edge" onClick={() => onDisconnect(menu.edgeId)} />
        </>
      )}
    </div>
  )
}

function MenuButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-elevated hover:text-text-primary">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

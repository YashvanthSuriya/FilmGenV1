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
import { Camera, Check, Clapperboard, Copy, Crosshair, Eraser, Film, Heart, Image, Link2Off, MousePointer2, Pin, Plus, Sparkles, Trash2, Video, type LucideIcon } from "lucide-react"
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
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { useProjectStore } from "@/lib/stores/project"
import type { AmateurWorkflowState, WorkspaceEdge, WorkspaceNode, WorkspaceNodeType } from "@/lib/types"
import { getSuggestedNextNodeTypes, validateConnection } from "@/lib/workspace/graphRules"

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
  const workspaceMode = useWorkspaceStore((state) => state.workspaceMode)
  const setWorkspaceMode = useProjectStore((state) => state.setWorkspaceMode)
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
  const setAmateurWorkflow = useWorkspaceStore((state) => state.setAmateurWorkflow)
  const [menu, setMenu] = useState<ContextMenuState>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [hideSuggestionsForNode, setHideSuggestionsForNode] = useState<string | null>(null)
  const [expandedSuggestionsForNode, setExpandedSuggestionsForNode] = useState<string | null>(null)
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

  if (workspaceMode === "amateur") {
    return <AmateurWorkspace onModeChange={setWorkspaceMode} onAmateurChange={setAmateurWorkflow} />
  }

  return (
    <div className="relative flex min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-background">
      <NodePalette onAddNode={(type) => createNode(type)} />
      <main className="relative min-w-0 flex-1">
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface/95 p-2 shadow-md">
          <WorkspaceModeSwitch mode="director" onChange={setWorkspaceMode} />
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

function AmateurWorkspace({ onModeChange, onAmateurChange }: { onModeChange: (mode: "amateur" | "director") => void; onAmateurChange: (patch: Partial<AmateurWorkflowState>) => void }) {
  const styleCards = useProjectStore((state) => state.styleCards)
  const actionCards = useProjectStore((state) => state.actionCards)
  const cameraConfig = useProjectStore((state) => state.cameraConfig)
  const addMediaClipToTimeline = useProjectStore((state) => state.addMediaClipToTimeline)
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const activeWorkspace = useWorkspaceStore((state) => state.workspaces.find((workspace) => workspace.id === activeWorkspaceId))
  const amateur = activeWorkspace?.amateur
  const styleCardId = amateur?.styleCardId ?? styleCards[0]?.id ?? ""
  const actionCardId = amateur?.actionCardId ?? actionCards[0]?.id ?? ""
  const prompt = amateur?.prompt ?? ""
  const outputType = amateur?.outputType ?? "video"
  const selectedStyle = styleCards.find((style) => style.id === styleCardId)
  const selectedAction = actionCards.find((action) => action.id === actionCardId)
  const previewPrompt = [
    selectedStyle ? `Style: ${selectedStyle.name}. ${selectedStyle.description}` : "",
    selectedAction ? `Action: ${selectedAction.beat}` : "",
    `Camera: ${cameraConfig.lens}, ${cameraConfig.movement}, ${cameraConfig.angle}`,
    `Prompt: ${prompt}`
  ].filter(Boolean).join("\n")

  return (
    <main className="relative min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-[#05090b] text-text-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,229,255,0.18),transparent_34%),radial-gradient(circle_at_42%_44%,rgba(71,111,255,0.2),transparent_28%),linear-gradient(180deg,rgba(4,16,20,0.9),rgba(5,7,9,1))]" />
      <div className="absolute left-4 top-4 z-20">
        <WorkspaceModeSwitch mode="amateur" onChange={onModeChange} />
      </div>
      <div className="absolute left-5 top-24 z-20 flex flex-col gap-5">
        {[MousePointer2, Plus, Image, Clapperboard].map((Icon, index) => (
          <button key={index} type="button" className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-border-subtle bg-surface/70 text-text-secondary backdrop-blur hover:border-accent-cyan hover:text-accent-cyan" aria-label="Workspace tool">
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="relative z-10 flex min-h-[calc(100vh-var(--nav-height))] flex-col items-center justify-between px-6 py-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <select value={styleCardId} onChange={(event) => onAmateurChange({ styleCardId: event.target.value, camera: cameraConfig, outputType, prompt })} className="h-9 rounded-[var(--radius-md)] border border-border-subtle bg-surface/80 px-3 text-sm text-text-primary outline-none">
              {styleCards.length === 0 ? <option value="">Style Auto</option> : styleCards.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}
            </select>
            <button type="button" className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface/80 px-3 text-sm text-text-secondary">
              <Heart className="h-4 w-4" />
              Liked
            </button>
          </div>
          <select value={actionCardId} onChange={(event) => onAmateurChange({ actionCardId: event.target.value, camera: cameraConfig, outputType, prompt })} className="h-9 max-w-48 rounded-[var(--radius-md)] border border-border-subtle bg-surface/80 px-3 text-sm text-text-primary outline-none">
            {actionCards.length === 0 ? <option value="">Action Auto</option> : actionCards.map((action) => <option key={action.id} value={action.id}>{action.title}</option>)}
          </select>
        </div>
        <section className="mb-28 max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Cinema Studio 3.5</p>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-transparent md:text-5xl" style={{ backgroundImage: "linear-gradient(90deg,#4d7dff,#67e8f9)", WebkitBackgroundClip: "text" }}>
            What would you shoot with infinite budget?
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <PromptChip icon={Sparkles} label={`Genre: ${selectedStyle?.mood?.split("/")[0]?.trim() ?? "General"}`} />
            <PromptChip icon={Film} label={`Style: ${selectedStyle?.name ?? "Auto"}`} />
            <PromptChip icon={Camera} label={`Camera: ${cameraConfig.lens}`} />
          </div>
        </section>
        <section className="w-full max-w-5xl">
          <div className="mx-auto grid grid-cols-[72px_minmax(0,1fr)] gap-3">
            <div className="grid overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-surface/80 p-1">
              {(["image", "video"] as const).map((type) => {
                const Icon = type === "image" ? Image : Video
                return (
                  <button key={type} type="button" onClick={() => onAmateurChange({ outputType: type, camera: cameraConfig, prompt })} className={`flex flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] py-3 text-[10px] font-semibold uppercase ${outputType === type ? "bg-elevated text-text-primary" : "text-text-secondary hover:text-accent-cyan"}`}>
                    <Icon className="h-4 w-4" />
                    {type}
                  </button>
                )
              })}
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface/90 p-4 shadow-lg shadow-black/30">
              <textarea value={prompt} onChange={(event) => onAmateurChange({ prompt: event.target.value, camera: cameraConfig, outputType })} placeholder="Describe your scene - use @ to add characters & locations" className="min-h-24 w-full resize-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <PromptChip icon={Sparkles} label="Cinema Studio 3.5" />
                  <PromptChip icon={Film} label="8s" />
                  <PromptChip icon={Camera} label="1080p" />
                </div>
                <button
                  type="button"
                  onClick={() => addMediaClipToTimeline({ id: `amateur-${Date.now()}`, type: outputType, name: `Amateur ${outputType}`, duration: outputType === "image" ? 5 : 8, url: outputType === "image" ? "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,184,0,0.12))" : undefined })}
                  className="h-12 rounded-[var(--radius-md)] bg-accent-cyan px-5 font-heading text-xs font-bold uppercase tracking-[0.08em] text-black shadow-cyan"
                >
                  Prepare <Sparkles className="ml-1 inline h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          <textarea readOnly value={previewPrompt} className="sr-only" aria-label="Assembled amateur prompt" />
        </section>
      </div>
    </main>
  )
}

function PromptChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-3 text-xs text-text-secondary backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-accent-cyan" />
      {label}
    </span>
  )
}

function WorkspaceModeSwitch({ mode, onChange }: { mode: "amateur" | "director"; onChange: (mode: "amateur" | "director") => void }) {
  return (
    <div className="flex rounded-full border border-border-subtle bg-background/80 p-1 shadow-md backdrop-blur">
      {(["amateur", "director"] as const).map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} className={`h-8 rounded-full px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] ${mode === item ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:text-text-primary"}`}>
          {item}
        </button>
      ))}
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

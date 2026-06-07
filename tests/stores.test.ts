import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useProjectStore } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { studioTabs } from "@/lib/types"
import { createInitialEditingState } from "@/lib/editor/timeline"

describe("frontend demo stores", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillRect: vi.fn(),
      fillText: vi.fn()
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,stitch")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("seeds a presentable project demo without credits or generated media state", () => {
    const state = useProjectStore.getState()

    expect(state.projectName).toBe("Neon Signal Demo")
    expect(state.activeTab).toBe("storyboard")
    expect(state.styleCards.length).toBeGreaterThan(0)
    expect(state.characters.length).toBeGreaterThan(0)
    expect(state.actionCards.length).toBeGreaterThan(0)
    expect(state.storyboardFrames.length).toBeGreaterThan(0)
    expect(state.assets.length).toBeGreaterThan(0)
    expect(state.editingState.clips.length).toBeGreaterThan(0)
    expect("credits" in state).toBe(false)
    expect("generatedMedia" in state).toBe(false)
  })

  it("caps local project memory at five projects", () => {
    useProjectStore.setState({
      activeProjectId: "project-1",
      projects: [
        {
          id: "project-1",
          projectId: "project-1",
          name: "Project 1",
          updatedAt: new Date(0).toISOString(),
          version: 1,
          syncStatus: "local",
          styleCards: [],
          characters: [],
          actionCards: [],
          storyboardFrames: [],
          storyboardStitches: [],
          assets: [],
          cameraConfig: { lens: "35mm", movement: "static", angle: "eye-level", aperture: "f/2.8", fps: 24 },
          editingState: createInitialEditingState(),
          workspaceMode: "amateur",
          workspaceMemory: { activeWorkspaceId: "workspace-1", workspaces: [], nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 } }
        }
      ],
      projectId: "project-1",
      projectName: "Project 1",
      styleCards: [],
      characters: [],
      actionCards: [],
      storyboardFrames: [],
      storyboardStitches: [],
      assets: [],
      editingState: createInitialEditingState(),
      workspaceMode: "amateur"
    })

    Array.from({ length: 8 }).forEach(() => useProjectStore.getState().createProject())

    expect(useProjectStore.getState().projects).toHaveLength(5)
  })

  it("creates a storyboard stitch payload and saves it as an image asset", () => {
    useProjectStore.setState({
      storyboardFrames: [
        { id: "shot-1", title: "First", prompt: "First shot", shotType: "Wide", cameraMovement: "Static", aspectRatio: "16:9", referenceImages: [] },
        { id: "shot-2", title: "Second", prompt: "Second shot", shotType: "Close-up", cameraMovement: "Pan", aspectRatio: "16:9", referenceImages: [] }
      ],
      storyboardStitches: [],
      assets: []
    })

    const stitch = useProjectStore.getState().createStoryboardStitch({ frameIds: ["shot-2", "shot-1"], title: "Board", feedback: "Make continuity clear." })

    expect(stitch?.promptPayload).toContain("NanoBanana 2")
    expect(stitch?.promptPayload).toContain("Make continuity clear.")
    expect(useProjectStore.getState().storyboardStitches).toHaveLength(1)
    expect(useProjectStore.getState().assets[0]).toMatchObject({ type: "image", name: "Board" })
  })

  it("imports image/video/audio assets into local project media", () => {
    useProjectStore.setState({ assets: [] })

    useProjectStore.getState().importAsset({
      id: "asset-user-video",
      source: "workspace",
      type: "video",
      name: "User Video",
      blobKey: "media-user-video",
      mimeType: "video/mp4",
      fileSize: 1200,
      createdAt: new Date(0).toISOString()
    })

    expect(useProjectStore.getState().assets[0]).toMatchObject({ id: "asset-user-video", type: "video", blobKey: "media-user-video" })
  })

  it("uses editing as the only editing tab value", () => {
    expect(studioTabs).toContain("editing")
    expect(studioTabs).not.toContain("editor")
  })

  it("renames projects only through explicit edit/save flow", () => {
    const projectA = {
      id: "project-a",
      projectId: "project-a",
      name: "Project A",
      updatedAt: new Date(0).toISOString(),
      version: 1,
      syncStatus: "local" as const,
      styleCards: [],
      characters: [],
      actionCards: [],
      storyboardFrames: [],
      storyboardStitches: [],
      assets: [],
      cameraConfig: { lens: "35mm", movement: "static", angle: "eye-level", aperture: "f/2.8", fps: 24 },
      editingState: createInitialEditingState(),
      workspaceMode: "amateur" as const,
      workspaceMemory: { activeWorkspaceId: "workspace-1", workspaces: [], nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 } }
    }
    const projectB = { ...projectA, id: "project-b", projectId: "project-b", name: "Project B" }
    useProjectStore.setState({
      activeProjectId: "project-a",
      projects: [projectA, projectB],
      projectId: "project-a",
      projectName: "Project A",
      renamingProjectId: null,
      renameDraft: ""
    })

    useProjectStore.getState().beginRenameProject("project-b")
    useProjectStore.getState().setProjectRenameDraft("Project B Edited")

    expect(useProjectStore.getState().activeProjectId).toBe("project-a")
    expect(useProjectStore.getState().projects.find((project) => project.id === "project-b")?.name).toBe("Project B")

    useProjectStore.getState().commitRenameProject()

    expect(useProjectStore.getState().activeProjectId).toBe("project-a")
    expect(useProjectStore.getState().projects.find((project) => project.id === "project-b")?.name).toBe("Project B Edited")
  })

  it("keeps workspace slots isolated in account-ready memory", () => {
    useWorkspaceStore.setState({
      activeWorkspaceId: "workspace-1",
      workspaces: [
        { id: "workspace-1", name: "Workspace 1", nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, lastAutosavedAt: null },
        { id: "workspace-2", name: "Workspace 2", nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 }, lastAutosavedAt: null }
      ],
      nodes: [],
      edges: [],
      selectedNode: null,
      inspectedNode: null
    })

    useWorkspaceStore.getState().addNode("prompt", { x: 10, y: 20 }, { prompt: "Workspace one" })
    useWorkspaceStore.getState().switchWorkspace("workspace-2")
    expect(useWorkspaceStore.getState().nodes).toEqual([])

    useWorkspaceStore.getState().addNode("imageOutput", { x: 30, y: 40 }, { label: "Workspace two output" })
    expect(useWorkspaceStore.getState().workspaces[1].nodes).toHaveLength(1)

    useWorkspaceStore.getState().switchWorkspace("workspace-1")
    expect(useWorkspaceStore.getState().nodes[0].data.prompt).toBe("Workspace one")
    expect(useWorkspaceStore.getState().workspaces[1].nodes[0].type).toBe("imageOutput")
  })
})

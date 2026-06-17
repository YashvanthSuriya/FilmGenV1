import { afterEach, describe, expect, it } from "vitest"
import { useProjectStore } from "@/lib/stores/project"
import { storyboardTemplates, useStoryboardStore } from "@/lib/stores/storyboard"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { studioTabs, type ProjectSlot } from "@/lib/types"
import { createInitialEditingState } from "@/lib/editor/timeline"

function projectSlot(id: string, name: string): ProjectSlot {
  return {
    id,
    projectId: id,
    name,
    updatedAt: new Date(0).toISOString(),
    version: 1,
    syncStatus: "local",
    styleCards: [],
    characters: [],
    actionCards: [],
    assets: [],
    cameraConfig: { body: "full-frame-cine", lens: "compact-anamorphic", focalLength: "35", movement: "static", angle: "eye-level", aperture: "f/2.8", fps: 24 },
    editingState: createInitialEditingState(),
    workspaceMode: "director",
    workspaceMemory: { activeWorkspaceId: "workspace-1", workspaces: [], nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.85 } }
  }
}

describe("frontend demo stores", () => {
  afterEach(() => {
    useStoryboardStore.setState({ projects: {} })
  })

  it("seeds a presentable project demo without credits or generated media state", () => {
    const state = useProjectStore.getState()

    expect(state.projectName).toBe("Neon Signal Demo")
    expect(state.activeTab).toBe("storyboard")
    expect(state.styleCards.length).toBeGreaterThan(0)
    expect(state.characters.length).toBeGreaterThan(0)
    expect(state.actionCards.length).toBeGreaterThan(0)
    expect(state.assets.length).toBeGreaterThan(0)
    expect(state.editingState.clips.length).toBeGreaterThan(0)
    expect("credits" in state).toBe(false)
    expect("generatedMedia" in state).toBe(false)
  })

  it("caps local project memory at five projects", () => {
    useProjectStore.setState({
      activeProjectId: "project-1",
      projects: [
        projectSlot("project-1", "Project 1")
      ],
      projectId: "project-1",
      projectName: "Project 1",
      styleCards: [],
      characters: [],
      actionCards: [],
      assets: [],
      editingState: createInitialEditingState(),
      workspaceMode: "director"
    })

    Array.from({ length: 8 }).forEach(() => useProjectStore.getState().createProject())

    expect(useProjectStore.getState().projects).toHaveLength(5)
  })

  it("creates persisted storyboard v2 generations and saves them into isolated card libraries", () => {
    const storyboard = useStoryboardStore.getState()

    storyboard.ensureProject("project-a")
    storyboard.ensureProject("project-b")
    storyboard.setSelectedTemplate("project-a", "cinematic-noir")

    const generation = useStoryboardStore.getState().createGeneration("project-a", {
      prompt: "A detective in an alley",
      templateId: "cinematic-noir",
      templateName: "Cinematic Noir",
      cardType: "style",
      referenceImages: [],
      aspectRatio: "16:9",
      model: "nanobanana-2",
      creditCost: 3,
      imageUrl: "data:image/png;base64,generation"
    })
    const card = useStoryboardStore.getState().addCardFromGenerations("project-a", {
      type: "style",
      name: "Noir Look",
      description: "Rain and shadows",
      generationIds: [generation.id]
    })

    expect(storyboardTemplates).toHaveLength(5)
    expect(storyboardTemplates[0]).not.toHaveProperty("injection")
    expect(storyboardTemplates[0]).toHaveProperty("guidanceSummary")
    expect(useStoryboardStore.getState().projects["project-a"].composer.cardType).toBe("style")
    expect(useStoryboardStore.getState().projects["project-a"].generations).toHaveLength(1)
    expect(useStoryboardStore.getState().projects["project-a"].cards.style).toHaveLength(1)
    expect(card?.images[0]).toMatchObject({ generationId: generation.id, imageUrl: generation.imageUrl })
    expect(useStoryboardStore.getState().projects["project-b"].generations).toEqual([])
    expect(useStoryboardStore.getState().projects["project-b"].cards.style).toEqual([])
  })

  it("stars storyboard generations and keeps mock poster placeholders compact", () => {
    const storyboard = useStoryboardStore.getState()

    storyboard.ensureProject("project-a")
    const generation = useStoryboardStore.getState().createGeneration("project-a", {
      prompt: "A quiet rooftop signal",
      cardType: "storyboard",
      referenceImages: [],
      aspectRatio: "16:9",
      model: "nanobanana-2",
      creditCost: 3,
      imageUrl: "filmgen-poster:image:storyboard:abc123"
    })

    useStoryboardStore.getState().toggleGenerationFavorite("project-a", generation.id)

    const storedGeneration = useStoryboardStore.getState().projects["project-a"].generations[0]
    expect(storedGeneration.favorite).toBe(true)
    expect(storedGeneration.imageUrl).toMatch(/^filmgen-poster:/)
    expect(storedGeneration.imageUrl.length).toBeLessThan(80)
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
    expect(studioTabs).not.toContain("export")
    expect(studioTabs).not.toContain("editor")
  })

  it("renames projects only through explicit edit/save flow", () => {
    const projectA = projectSlot("project-a", "Project A")
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

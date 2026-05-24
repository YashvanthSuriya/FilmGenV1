import { describe, expect, it } from "vitest"
import type { WorkspaceEdge, WorkspaceNode } from "@/lib/types"
import { studioTabs } from "@/lib/types"
import { topologicalSort, WorkspaceCycleError } from "@/lib/workspace/execution"
import { getSuggestedNextNodeTypes, validateConnection } from "@/lib/workspace/graphRules"
import { assemblePromptForNode } from "@/lib/workspace/promptAssembly"
import { createWorkspaceNodesFromFrame } from "@/lib/stores/project"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { createWorkspaceAsset } from "@/lib/media/assets"

function node(id: string, type: WorkspaceNode["type"], data: WorkspaceNode["data"] = {}): WorkspaceNode {
  return { id, type, position: { x: 0, y: 0 }, data }
}

function edge(source: string, target: string): WorkspaceEdge {
  return { id: `${source}-${target}`, source, target }
}

describe("workspace execution", () => {
  it("sorts dependencies before dependent nodes", () => {
    const nodes = [node("prompt", "prompt"), node("image", "imageOutput"), node("style", "styleCard")]
    const edges = [edge("style", "prompt"), edge("prompt", "image")]

    expect(topologicalSort(nodes, edges)).toEqual(["style", "prompt", "image"])
  })

  it("detects cycles", () => {
    const nodes = [node("a", "prompt"), node("b", "combiner")]
    const edges = [edge("a", "b"), edge("b", "a")]

    expect(() => topologicalSort(nodes, edges)).toThrow(WorkspaceCycleError)
  })
})

describe("workspace prompt assembly", () => {
  it("includes style, character, camera, prompt, and script pieces", () => {
    const nodes = [
      node("style", "styleCard", { styleCardId: "style-1" }),
      node("character", "character", { characterId: "char-1" }),
      node("camera", "cameraConfig", {
        camera: { lens: "50mm", movement: "dolly-in", angle: "low-angle", aperture: "f/1.8", fps: 24 }
      }),
      node("prompt", "prompt", { prompt: "A neon alley confrontation." }),
      node("script", "script", { script: "The detective pauses before the door." }),
      node("image", "imageOutput")
    ]
    const edges = [
      edge("style", "image"),
      edge("character", "image"),
      edge("camera", "image"),
      edge("prompt", "image"),
      edge("script", "image")
    ]

    const prompt = assemblePromptForNode("image", {
      nodes,
      edges,
      styleCards: [
        {
          id: "style-1",
          name: "Neo Noir",
          description: "High contrast urban rain",
          mood: "tense",
          palette: ["cyan", "amber"],
          keywords: [],
          referenceImages: [],
          generatedImages: []
        }
      ],
      characters: [
        {
          id: "char-1",
          name: "Mara",
          role: "Detective",
          description: "Quiet and watchful",
          emotions: [],
          portraitUrls: [],
          styleCardIds: []
        }
      ]
    })

    expect(prompt).toContain("Neo Noir")
    expect(prompt).toContain("Mara")
    expect(prompt).toContain("50mm")
    expect(prompt).toContain("A neon alley confrontation.")
    expect(prompt).toContain("The detective pauses before the door.")
  })

  it("keeps workspace as a valid studio tab", () => {
    expect(studioTabs).toContain("workspace")
    expect(studioTabs).toContain("editing")
    expect(studioTabs).not.toContain("editor")
  })
})

describe("workspace graph rules", () => {
  it("suggests logical next nodes", () => {
    expect(getSuggestedNextNodeTypes("prompt")).toContain("imageOutput")
    expect(getSuggestedNextNodeTypes("videoOutput")).toEqual(["preview"])
    expect(getSuggestedNextNodeTypes("preview")).toEqual([])
  })

  it("rejects duplicate, cyclic, and illogical connections", () => {
    const nodes = [node("prompt", "prompt"), node("image", "imageOutput"), node("style", "styleCard")]
    const edges = [edge("prompt", "image")]

    expect(validateConnection("prompt", "image", nodes, edges).ok).toBe(false)
    expect(validateConnection("image", "style", nodes, edges).ok).toBe(false)
    expect(validateConnection("style", "prompt", nodes, edges).ok).toBe(true)
    expect(validateConnection("image", "prompt", nodes, edges).ok).toBe(false)
  })
})

describe("connected storyboard and workspace assets", () => {
  it("converts a storyboard frame into a connected workspace graph", () => {
    const result = createWorkspaceNodesFromFrame(
      {
        id: "frame-1",
        title: "Opening Shot",
        prompt: "A quiet moonlit street.",
        shotType: "Wide",
        cameraMovement: "Dolly",
        aspectRatio: "16:9",
        referenceImages: ["linear-gradient(red, blue)"]
      },
      0
    )

    expect(result.nodes.map((item) => item.type)).toEqual(["prompt", "cameraConfig", "imageOutput"])
    expect(result.edges).toHaveLength(2)
    expect(result.nodes[0].data.prompt).toContain("moonlit")
    expect(result.nodes[2].data.storyboardFrameId).toBe("frame-1")
  })

  it("publishes workspace output nodes as local media assets", () => {
    const asset = createWorkspaceAsset(
      node("video-output", "videoOutput", {
        label: "Final Shot",
        sourcePrompt: "A neon street reveal."
      })
    )

    expect(asset).toMatchObject({
      source: "workspace",
      type: "video",
      name: "Final Shot",
      workspaceNodeId: "video-output"
    })
    expect(asset.prompt).toContain("neon")
  })
})

describe("workspace project slots", () => {
  it("keeps five selectable workspace memories isolated", () => {
    useWorkspaceStore.setState({
      activeWorkspaceId: "workspace-1",
      workspaces: Array.from({ length: 5 }, (_, index) => ({
        id: `workspace-${index + 1}`,
        name: `Workspace ${index + 1}`,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 0.85 },
        lastAutosavedAt: null
      })),
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

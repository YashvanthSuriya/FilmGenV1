import { describe, expect, it } from "vitest"
import type { WorkspaceEdge, WorkspaceNode } from "@/lib/types"
import { studioTabs } from "@/lib/types"
import { getSuggestedNextNodeTypes, validateConnection } from "@/lib/workspace/graphRules"
import { assemblePromptForNode } from "@/lib/workspace/promptAssembly"
import { analyzeWorkspaceOutput, createWorkspaceMockAsset, getPreviewOutputNodes } from "@/lib/workspace/workflowRun"
import { useWorkspaceStore } from "@/lib/stores/workspace"

function node(id: string, type: WorkspaceNode["type"], data: WorkspaceNode["data"] = {}): WorkspaceNode {
  return { id, type, position: { x: 0, y: 0 }, data }
}

function edge(source: string, target: string): WorkspaceEdge {
  return { id: `${source}-${target}`, source, target }
}

describe("workspace prompt assembly", () => {
  it("includes style, character, camera, prompt, and script pieces", () => {
    const nodes = [
      node("style", "styleCard", { styleCardId: "style-1" }),
      node("action", "actionCard", { actionCardId: "action-1" }),
      node("character", "character", { characterId: "char-1" }),
      node("camera", "cameraConfig", {
        camera: { body: "full-frame-cine", lens: "compact-anamorphic", focalLength: "50", movement: "dolly-in", angle: "low-angle", aperture: "f/1.8", fps: 24 }
      }),
      node("prompt", "prompt", { prompt: "A neon alley confrontation." }),
      node("script", "script", { script: "The detective pauses before the door." }),
      node("image", "imageOutput")
    ]
    const edges = [
      edge("style", "image"),
      edge("action", "image"),
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
      ],
      actionCards: [
        {
          id: "action-1",
          title: "Door Pause",
          beat: "The detective stops before entering.",
          subject: "Mara",
          action: "hesitates at the threshold",
          emotion: "uneasy"
        }
      ]
    })

    expect(prompt).toContain("Neo Noir")
    expect(prompt).toContain("Mara")
    expect(prompt).toContain("Door Pause")
    expect(prompt).toContain("50mm")
    expect(prompt).toContain("A neon alley confrontation.")
    expect(prompt).toContain("The detective pauses before the door.")
  })

  it("keeps workspace as a valid studio tab", () => {
    expect(studioTabs).toContain("workspace")
    expect(studioTabs).toContain("editing")
    expect(studioTabs).not.toContain("export")
    expect(studioTabs).not.toContain("editor")
  })

  it("uses the first available action card when an action node has not persisted a selection", () => {
    const prompt = assemblePromptForNode("image", {
      nodes: [node("action", "actionCard"), node("image", "imageOutput")],
      edges: [edge("action", "image")],
      styleCards: [],
      characters: [],
      actionCards: [
        {
          id: "action-1",
          title: "First Beat",
          beat: "The first visible action.",
          subject: "Lead",
          action: "moves first",
          emotion: "focused"
        }
      ]
    })

    expect(prompt).toContain("First Beat")
  })
})

describe("workspace graph rules", () => {
  it("suggests logical next nodes", () => {
    expect(getSuggestedNextNodeTypes("prompt")).toContain("imageOutput")
    expect(getSuggestedNextNodeTypes("actionCard")).toContain("prompt")
    expect(getSuggestedNextNodeTypes("cameraConfig")).not.toContain("preview")
    expect(getSuggestedNextNodeTypes("script")).not.toContain("preview")
    expect(getSuggestedNextNodeTypes("combiner")).not.toContain("preview")
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

describe("workspace output analysis", () => {
  const styleCard = {
    id: "style-1",
    name: "Neo Noir",
    description: "Rain and neon",
    mood: "tense",
    palette: ["cyan", "amber"],
    keywords: [],
    referenceImages: [],
    generatedImages: []
  }
  const character = {
    id: "char-1",
    name: "Mara",
    role: "Detective",
    description: "Quiet and watchful",
    emotions: [],
    portraitUrls: [],
    styleCardIds: []
  }
  const actionCard = {
    id: "action-1",
    title: "Door Pause",
    beat: "The detective stops before entering.",
    subject: "Mara",
    action: "hesitates at the threshold",
    emotion: "uneasy"
  }

  it("blocks output runs when no creative instruction reaches the node", () => {
    const result = analyzeWorkspaceOutput("image", {
      nodes: [node("image", "imageOutput")],
      edges: [],
      styleCards: [],
      characters: [],
      actionCards: []
    })

    expect(result.ok).toBe(false)
    expect(result.blockers.join(" ")).toContain("Prompt")
  })

  it("accepts a complete image generation chain", () => {
    const nodes = [
      node("style", "styleCard", { styleCardId: "style-1" }),
      node("character", "character", { characterId: "char-1" }),
      node("action", "actionCard", { actionCardId: "action-1" }),
      node("camera", "cameraConfig", { camera: { body: "full-frame-cine", lens: "compact-anamorphic", focalLength: "35", movement: "dolly", angle: "eye-level", aperture: "f/2.8", fps: 24 } }),
      node("prompt", "prompt", { prompt: "A tense doorway reveal." }),
      node("image", "imageOutput")
    ]
    const result = analyzeWorkspaceOutput("image", {
      nodes,
      edges: [edge("style", "prompt"), edge("character", "prompt"), edge("action", "prompt"), edge("prompt", "image"), edge("camera", "image")],
      styleCards: [styleCard],
      characters: [character],
      actionCards: [actionCard]
    })

    expect(result.ok).toBe(true)
    expect(result.compiledPrompt).toContain("A tense doorway reveal.")
    expect(result.compiledPrompt).toContain("Door Pause")
  })

  it("requires a direct image source to be run before image-to-video", () => {
    const nodes = [
      node("prompt", "prompt", { prompt: "Turn the keyframe into a slow push-in." }),
      node("image", "imageOutput"),
      node("video", "videoOutput")
    ]
    const blocked = analyzeWorkspaceOutput("video", {
      nodes,
      edges: [edge("prompt", "image"), edge("image", "video")],
      styleCards: [],
      characters: [],
      actionCards: []
    })

    expect(blocked.ok).toBe(false)
    expect(blocked.blockers.join(" ")).toContain("Image Output")

    const ready = analyzeWorkspaceOutput("video", {
      nodes: nodes.map((item) => (item.id === "image" ? { ...item, data: { ...item.data, assetId: "asset-image" } } : item)),
      edges: [edge("prompt", "image"), edge("image", "video")],
      styleCards: [],
      characters: [],
      actionCards: []
    })

    expect(ready.ok).toBe(true)
  })

  it("creates lightweight workspace assets and previews direct output links", () => {
    const imageNode = node("image", "imageOutput", { label: "Generated Frame" })
    const videoNode = node("video", "videoOutput", { label: "Generated Clip" })
    const previewNode = node("preview", "preview")
    const asset = createWorkspaceMockAsset({
      node: imageNode,
      projectId: "project-1",
      compiledPrompt: "A cinematic frame.",
      mediaType: "imageOutput"
    })
    const outputs = getPreviewOutputNodes("preview", [imageNode, videoNode, previewNode], [edge("image", "video"), edge("video", "preview")])

    expect(asset.source).toBe("workspace")
    expect(asset.type).toBe("image")
    expect(asset.thumbnailUrl).toContain("data:image/svg+xml")
    expect(outputs.map((item) => item.id)).toEqual(["video"])
  })
})

describe("workspace project slots", () => {
  it("keeps selectable workspace memories isolated", () => {
    useWorkspaceStore.setState({
      activeWorkspaceId: "workspace-1",
      workspaces: Array.from({ length: 2 }, (_, index) => ({
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

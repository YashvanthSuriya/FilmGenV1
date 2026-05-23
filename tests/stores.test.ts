import { describe, expect, it } from "vitest"
import { useProjectStore } from "@/lib/stores/project"
import { useUserStore } from "@/lib/stores/user"
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { studioTabs } from "@/lib/types"

describe("Cine Studio Phase 1 stores", () => {
  it("defaults the project to free tier storyboard state", () => {
    const state = useProjectStore.getState()

    expect(state.plan).toBe("free")
    expect(state.credits).toBe(50)
    expect(state.activeTab).toBe("storyboard")
    expect(state.styleCards).toEqual([])
    expect(state.characters).toEqual([])
    expect(state.storyboardFrames).toEqual([])
    expect(state.workspaceNodes).toEqual([])
    expect(state.workspaceEdges).toEqual([])
    expect(state.generatedMedia).toEqual([])
    expect(state.cameraConfig.fps).toBe(24)
  })

  it("uses editing as the only editing tab value", () => {
    expect(studioTabs).toContain("editing")
    expect(studioTabs).not.toContain("editor")
  })

  it("defaults the user and workspace stores", () => {
    const user = useUserStore.getState()
    const workspace = useWorkspaceStore.getState()

    expect(user.plan).toBe("free")
    expect(user.credits).toBe(50)
    expect(workspace.nodes).toEqual([])
    expect(workspace.edges).toEqual([])
    expect(workspace.selectedNode).toBeNull()
  })

  it("logs local credit spend events before generated assets are added", () => {
    const before = useProjectStore.getState().credits
    const didSpend = useProjectStore.getState().spendCredits(2, "Unit test generation")
    const state = useProjectStore.getState()

    expect(didSpend).toBe(true)
    expect(state.credits).toBe(before - 2)
    expect(state.creditEvents[0]).toMatchObject({
      type: "spend",
      amount: -2,
      description: "Unit test generation"
    })
  })
})

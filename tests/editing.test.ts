import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ColorGradingPanel } from "@/components/editing/color/ColorGradingPanel"
import { EditingLayout } from "@/components/editing/EditingLayout"
import { InspectorPanel } from "@/components/editing/InspectorPanel"
import { MediaPanel } from "@/components/editing/MediaPanel"
import { PreviewPlayer } from "@/components/editing/PreviewPlayer"
import { clampPlayhead, formatTimecode, nextPlaybackPosition, parseTimecode, shouldRestartPlayback } from "@/lib/editing/playback"
import { applyCurve, colorWheelToAdjustments, computePreviewFilter } from "@/lib/editing/colorGrade"
import { applyTransition, removeTransition } from "@/lib/editing/transitions"
import { createClipFromAsset, defaultTrackForAsset } from "@/lib/media/assets"
import { useProjectStore } from "@/lib/stores/project"
import type { ProjectAsset } from "@/lib/types"
import {
  addClip,
  createDefaultTracks,
  createInitialEditingState,
  createTimelineClip,
  deleteClip,
  ensureEditingStateDefaults,
  moveClip,
  resolveClipStart,
  splitClip,
  trimClip
} from "@/lib/editing/timeline"

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    createImageData: vi.fn((width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) })),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    putImageData: vi.fn(),
    stroke: vi.fn()
  } as unknown as CanvasRenderingContext2D)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("Phase 4 editing timeline", () => {
  it("creates the default four track editing state", () => {
    const state = createInitialEditingState()

    expect(state.tracks.map((track) => track.name)).toEqual(["Video V1", "Video V2", "Audio A1", "Graphics O1"])
    expect(state.tracks.map((track) => track.type)).toEqual(["video", "video", "audio", "overlay"])
    expect(state.playheadPosition).toBe(0)
    expect(state.selectedClipId).toBeNull()
  })

  it("adds and deletes clips deterministically", () => {
    const clip = createTimelineClip({
      id: "clip-1",
      trackId: "track-video-v1",
      type: "video",
      name: "Opening",
      start: 2,
      duration: 4
    })

    const added = addClip([], clip)
    expect(added).toHaveLength(1)
    expect(added[0].outPoint).toBe(4)
    expect(deleteClip(added, clip.id)).toEqual([])
  })

  it("splits clips and rejects invalid split positions", () => {
    const clip = createTimelineClip({
      id: "clip-1",
      trackId: "track-video-v1",
      type: "video",
      name: "Opening",
      start: 5,
      duration: 6
    })

    const unchanged = splitClip([clip], clip.id, 5)
    expect(unchanged).toEqual([clip])

    const split = splitClip([clip], clip.id, 8)
    expect(split).toHaveLength(2)
    expect(split[0]).toMatchObject({ start: 5, duration: 3, inPoint: 0, outPoint: 3 })
    expect(split[1]).toMatchObject({ start: 8, duration: 3, inPoint: 3, outPoint: 6 })
  })

  it("moves and trims clips while respecting locked tracks and non-negative starts", () => {
    const tracks = createDefaultTracks()
    const lockedTracks = tracks.map((track) => (track.id === "track-video-v2" ? { ...track, locked: true } : track))
    const clip = createTimelineClip({
      id: "clip-1",
      trackId: "track-video-v1",
      type: "video",
      name: "Opening",
      start: 3,
      duration: 5
    })

    expect(moveClip([clip], lockedTracks, clip.id, "track-video-v2", 1)[0].trackId).toBe("track-video-v1")
    expect(moveClip([clip], tracks, clip.id, "track-video-v1", -3)[0].start).toBe(0)

    const trimmed = trimClip([clip], clip.id, "start", 5)[0]
    expect(trimmed.start).toBe(5)
    expect(trimmed.duration).toBe(3)
    expect(trimmed.inPoint).toBe(2)
  })

  it("moves overlapping clips to the next open spot on a lane", () => {
    const first = createTimelineClip({ id: "a", trackId: "track-video-v1", type: "video", name: "A", start: 0, duration: 4 })
    const second = createTimelineClip({ id: "b", trackId: "track-video-v1", type: "video", name: "B", start: 8, duration: 3 })

    expect(resolveClipStart([first, second], "new", "track-video-v1", 2, 2)).toBe(4.25)
    expect(moveClip([first, second], createDefaultTracks(), second.id, "track-video-v1", 1)[1].start).toBe(4.25)
  })

  it("extends image clips by trimming the end while preventing same-track overlap", () => {
    const image = createTimelineClip({ id: "image", trackId: "track-video-v1", type: "image", name: "Still", start: 0, duration: 3 })
    const next = createTimelineClip({ id: "next", trackId: "track-video-v1", type: "image", name: "Next", start: 8, duration: 2 })

    const extended = trimClip([image], image.id, "end", 7)[0]
    expect(extended).toMatchObject({ duration: 7, outPoint: 7 })

    const clamped = trimClip([image, next], image.id, "end", 10).find((clip) => clip.id === image.id)
    expect(clamped?.duration).toBe(7.75)
  })

  it("formats and parses 24fps timecode", () => {
    expect(formatTimecode(65.5)).toBe("00:01:05:12")
    expect(parseTimecode("00:01:05:12")).toBe(65.5)
    expect(parseTimecode("00:00:00:24")).toBeNull()
  })

  it("advances playback from elapsed time and restarts from the end", () => {
    expect(clampPlayhead(12, 8)).toBe(8)
    expect(shouldRestartPlayback(8, 8)).toBe(true)
    expect(nextPlaybackPosition({ startedAt: 1000, startPosition: 2, now: 2500, speed: 2, duration: 8 })).toBe(5)
    expect(nextPlaybackPosition({ startedAt: 1000, startPosition: 7.5, now: 2500, speed: 2, duration: 8 })).toBe(8)
  })

  it("applies and removes transitions between clips on the same track", () => {
    const first = createTimelineClip({ id: "a", trackId: "track-video-v1", type: "video", name: "A", start: 0, duration: 3 })
    const second = createTimelineClip({ id: "b", trackId: "track-video-v1", type: "video", name: "B", start: 3, duration: 3 })
    const third = createTimelineClip({ id: "c", trackId: "track-audio-a1", type: "audio", name: "C", start: 0, duration: 3 })

    const rejected = applyTransition([], [first, third], first.id, third.id, "dissolve")
    expect(rejected).toEqual([])

    const applied = applyTransition([], [first, second], first.id, second.id, "dissolve")
    expect(applied).toHaveLength(1)
    expect(applied[0]).toMatchObject({ fromClipId: "a", toClipId: "b", type: "dissolve" })
    expect(removeTransition(applied, applied[0].id)).toEqual([])
  })

  it("maps project assets to compatible timeline clips", () => {
    const tracks = createDefaultTracks()
    const videoAsset = {
      id: "asset-video",
      source: "storyboard" as const,
      type: "video" as const,
      name: "Imported Video",
      createdAt: new Date(0).toISOString(),
      duration: 8
    }
    const audioAsset = { ...videoAsset, id: "asset-audio", type: "audio" as const, name: "Imported Audio" }

    expect(defaultTrackForAsset(videoAsset, tracks)?.type).toBe("video")
    expect(defaultTrackForAsset(audioAsset, tracks)?.type).toBe("audio")

    const clip = createClipFromAsset(videoAsset, "track-video-v1", 3, "blob:local")
    expect(clip).toMatchObject({
      assetId: "asset-video",
      source: "storyboard",
      trackId: "track-video-v1",
      type: "video",
      start: 3,
      url: "blob:local"
    })
  })

})

describe("Editor repair regressions", () => {
  beforeEach(() => {
    useProjectStore.setState({
      assets: [
        {
          id: "asset-image",
          source: "storyboard",
          type: "image",
          name: "Storyboard Still",
          url: "linear-gradient(red, blue)",
          createdAt: new Date(0).toISOString()
        },
        {
          id: "asset-audio",
          source: "workspace",
          type: "audio",
          name: "Room Tone",
          duration: 4,
          createdAt: new Date(0).toISOString()
        }
      ] satisfies ProjectAsset[],
      editingState: createInitialEditingState()
    })
  })

  it("keeps the media asset list as the scroll owner", () => {
    const { container } = render(React.createElement(MediaPanel))

    const scrollArea = container.querySelector("[data-testid='media-asset-scroll']")
    expect(scrollArea?.className).toContain("overflow-y-auto")
    expect(scrollArea?.className).toContain("lg:flex-col")
  })

  it("creates copy drag payloads from media cards", () => {
    render(React.createElement(MediaPanel))
    const card = screen.getByText("Storyboard Still").closest("[draggable='true']")
    const data = new Map<string, string>()
    const dataTransfer = {
      effectAllowed: "none",
      setData: vi.fn((type: string, value: string) => data.set(type, value))
    }

    fireEvent.dragStart(card!, { dataTransfer })

    expect(dataTransfer.effectAllowed).toBe("copy")
    expect(data.get("application/x-cine-asset")).toBe("asset-image")
    expect(data.get("text/plain")).toBe("asset-image")
    expect(card?.getAttribute("data-asset-type")).toBe("image")
  })

  it("rejects generated media on incompatible timeline tracks", () => {
    const store = useProjectStore.getState()

    store.addMediaClipToTimeline({ id: "generated-audio", type: "audio", name: "Generated Voice", duration: 3 }, "track-video-v1", 0)
    expect(useProjectStore.getState().editingState.clips).toHaveLength(0)

    store.addMediaClipToTimeline({ id: "generated-audio", type: "audio", name: "Generated Voice", duration: 3 }, "track-audio-a1", 0)
    expect(useProjectStore.getState().editingState.clips[0]).toMatchObject({ mediaId: "generated-audio", trackId: "track-audio-a1", type: "audio" })
  })

  it("ignores invalid numeric inspector edits", () => {
    const clip = createTimelineClip({ id: "clip-image", trackId: "track-video-v1", type: "image", name: "Still", duration: 5, opacity: 80 })
    useProjectStore.setState((state) => ({ editingState: { ...state.editingState, clips: [clip], selectedClipId: clip.id } }))
    render(React.createElement(InspectorPanel))

    fireEvent.change(screen.getByLabelText("Opacity"), { target: { value: "" } })
    expect(useProjectStore.getState().editingState.clips[0].opacity).toBe(80)

    fireEvent.change(screen.getByLabelText("Opacity"), { target: { value: "140" } })
    expect(useProjectStore.getState().editingState.clips[0].opacity).toBe(100)
  })

  it("keeps scopes visible on every color tab", () => {
    render(React.createElement(ColorGradingPanel))

    expect(screen.getByText("Waveform")).toBeTruthy()
    fireEvent.click(screen.getByText("wheels"))
    expect(screen.getByText("Waveform")).toBeTruthy()
    fireEvent.click(screen.getByText("look"))
    expect(screen.getByText("Waveform")).toBeTruthy()
  })

  it("shows selected media while paused but not in playback gaps", () => {
    const clip = createTimelineClip({ id: "clip-image", trackId: "track-video-v1", type: "image", name: "Opening Still", start: 0, duration: 2, url: "linear-gradient(red, blue)" })
    useProjectStore.setState((state) => ({
      editingState: {
        ...state.editingState,
        clips: [clip],
        selectedClipId: clip.id,
        playheadPosition: 5,
        playbackState: "paused"
      }
    }))
    const { rerender } = render(React.createElement(PreviewPlayer, { duration: 8 }))
    expect(screen.getByText("Opening Still")).toBeTruthy()

    useProjectStore.setState((state) => ({ editingState: { ...state.editingState, playbackState: "playing" } }))
    rerender(React.createElement(PreviewPlayer, { duration: 8 }))
    expect(screen.queryByText("Opening Still")).toBeNull()
    expect(screen.getByText("Select or scrub over media")).toBeTruthy()
  })

  it("skips editor keyboard shortcuts while an input is focused", () => {
    const clip = createTimelineClip({ id: "clip-image", trackId: "track-video-v1", type: "image", name: "Still", duration: 5 })
    useProjectStore.setState((state) => ({ editingState: { ...state.editingState, clips: [clip], selectedClipId: clip.id } }))
    render(React.createElement(EditingLayout))

    const nameInput = screen.getByLabelText("Name")
    nameInput.focus()
    fireEvent.keyDown(nameInput, { key: "Delete" })

    expect(useProjectStore.getState().editingState.clips).toHaveLength(1)
  })
})

describe("Phase 5 editing suite state", () => {
  beforeEach(() => {
    useProjectStore.setState({ editingState: createInitialEditingState() })
  })

  it("creates color, audio, and text defaults with the editing state", () => {
    const state = createInitialEditingState()

    expect(state.colorGrading.lut).toEqual({ name: "Natural", intensity: 0 })
    expect(state.colorGrading.manual.temperature).toBe(6500)
    expect(state.colorGrading.activeScope).toBe("waveform")
    expect(state.audioState.musicTracks).toEqual([])
    expect(state.audioState.mixer.volumeAutomation).toBe(50)
    expect(state.textOverlays.clips).toEqual([])
  })

  it("recovers defaults from missing persisted editing state", () => {
    const state = ensureEditingStateDefaults(null)

    expect(state.tracks).toHaveLength(4)
    expect(state.colorGrading.lut.name).toBe("Natural")
    expect(state.audioState.mixer.pan).toBe(0)
    expect(state.textOverlays.clips).toEqual([])
  })

  it("updates and clamps manual color controls and LUT intensity", () => {
    const store = useProjectStore.getState()

    store.updateColorManualControls({ exposure: 8, temperature: 12000, saturation: -125 })
    store.selectLut("Noir")
    store.setLutIntensity(140)

    const color = useProjectStore.getState().editingState.colorGrading
    expect(color.manual.exposure).toBe(2)
    expect(color.manual.temperature).toBe(10000)
    expect(color.manual.saturation).toBe(-100)
    expect(color.lut).toEqual({ name: "Noir", intensity: 100 })
  })

  it("computes visible color grade output from manual controls, wheels, curves, and LUTs", () => {
    const state = createInitialEditingState().colorGrading
    const neutral = computePreviewFilter(state)
    state.manual.exposure = 1
    state.manual.saturation = 35
    state.lut = { name: "Noir", intensity: 75 }
    state.gain = { hue: 180, saturation: 50, luminance: 20 }
    state.curves.master = [{ id: "point-0", x: 0, y: 1 }, { id: "mid", x: 0.5, y: 0.25 }, { id: "point-1", x: 1, y: 0 }]

    expect(computePreviewFilter(state)).not.toBe(neutral)
    expect(colorWheelToAdjustments(state.gain).saturation).toBeGreaterThan(0)
    expect(applyCurve(state.curves.master, 0.5)).toBeGreaterThan(0.7)
  })

  it("adds, updates, and removes curve points", () => {
    const store = useProjectStore.getState()

    store.addCurvePoint("master", { x: 0.5, y: 0.25 })
    const added = useProjectStore.getState().editingState.colorGrading.curves.master.find((point) => point.x === 0.5)
    expect(added?.y).toBe(0.25)

    store.updateCurvePoint("master", added!.id, { x: 0.75, y: 1.25 })
    const moved = useProjectStore.getState().editingState.colorGrading.curves.master.find((point) => point.id === added!.id)
    expect(moved).toMatchObject({ x: 0.75, y: 1 })

    store.removeCurvePoint("master", added!.id)
    expect(useProjectStore.getState().editingState.colorGrading.curves.master).toHaveLength(2)

    store.addCurvePoint("master", { x: 0.5, y: 0.5 })
    store.removeCurvePoint("master", "point-0")
    expect(useProjectStore.getState().editingState.colorGrading.curves.master.some((point) => point.id === "point-0")).toBe(true)
  })

  it("updates color preview mode and audio mixer state", () => {
    const store = useProjectStore.getState()

    store.setColorPreviewMode("before")
    store.updateAudioMixer({ reverb: 120, pan: -140 })

    const state = useProjectStore.getState().editingState
    expect(state.colorGrading.previewMode).toBe("before")
    expect(state.audioState.mixer.reverb).toBe(100)
    expect(state.audioState.mixer.pan).toBe(-100)
  })

  it("updates text overlay settings for overlay clips", () => {
    const overlayClip = createTimelineClip({
      id: "title-1",
      trackId: "track-overlay-o1",
      type: "overlay",
      name: "Opening Title",
      duration: 3
    })

    useProjectStore.getState().addTimelineClip(overlayClip)
    useProjectStore.getState().updateTextOverlay(overlayClip.id, {
      text: "A NIGHT IN NEON",
      fontFamily: "DM Sans",
      size: 400,
      animation: "Glow",
      safeAreaSnapping: false
    })

    expect(useProjectStore.getState().editingState.textOverlays.clips[0]).toMatchObject({
      clipId: "title-1",
      text: "A NIGHT IN NEON",
      fontFamily: "DM Sans",
      size: 240,
      animation: "Glow",
      safeAreaSnapping: false
    })
  })
})

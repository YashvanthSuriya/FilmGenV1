import { beforeEach, describe, expect, it } from "vitest"
import { formatTimecode, parseTimecode } from "@/lib/editing/playback"
import { applyCurve, colorWheelToAdjustments, computePreviewFilter } from "@/lib/editing/colorGrade"
import { applyTransition, removeTransition } from "@/lib/editing/transitions"
import { createClipFromAsset, defaultTrackForAsset } from "@/lib/media/assets"
import { useProjectStore } from "@/lib/stores/project"
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
      source: "import" as const,
      type: "video" as const,
      name: "Imported Video",
      createdAt: new Date(0).toISOString(),
      blobKey: "asset-video",
      duration: 8
    }
    const audioAsset = { ...videoAsset, id: "asset-audio", type: "audio" as const, name: "Imported Audio" }

    expect(defaultTrackForAsset(videoAsset, tracks)?.type).toBe("video")
    expect(defaultTrackForAsset(audioAsset, tracks)?.type).toBe("audio")

    const clip = createClipFromAsset(videoAsset, "track-video-v1", 3, "blob:local")
    expect(clip).toMatchObject({
      assetId: "asset-video",
      source: "import",
      trackId: "track-video-v1",
      type: "video",
      start: 3,
      url: "blob:local"
    })
  })
})

describe("Phase 5 editing suite state", () => {
  beforeEach(() => {
    useProjectStore.setState({ editingState: createInitialEditingState(), credits: 50, creditEvents: [] })
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

  it("updates color preview mode and audio mock state", () => {
    const store = useProjectStore.getState()

    store.setColorPreviewMode("before")
    store.generateMockMusic({ prompt: "pulse", duration: 240, genre: "Noir", intensity: "Intense" })
    store.generateMockVoiceover({ script: "One two three", voice: "Ava", speed: 3, pitch: -20 })
    store.addMockSfxToTimeline({ id: "door", name: "Door close", category: "Foley", duration: 2 }, 4)

    const state = useProjectStore.getState().editingState
    expect(state.colorGrading.previewMode).toBe("before")
    expect(state.audioState.musicTracks[0]).toMatchObject({ prompt: "pulse", duration: 180 })
    expect(state.audioState.voiceovers[0]).toMatchObject({ voice: "Ava", speed: 2, pitch: -12 })
    expect(state.clips[0]).toMatchObject({ type: "audio", name: "Door close", start: 4 })
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

import type {
  AudioStudioState,
  ColorGradingState,
  EditingState,
  GeneratedMedia,
  TextOverlayClip,
  TextOverlayState,
  TimelineClip,
  TimelineClipType,
  TimelineTrack,
  TimelineTrackType
} from "@/lib/types"

const DEFAULT_CLIP_DURATION = 5
const MIN_CLIP_DURATION = 0.25
const CLIP_GAP = 0.25
const SNAP_INTERVAL = 0.25
const SNAP_THRESHOLD = 0.12

export function createDefaultTracks(): TimelineTrack[] {
  return [
    createTrack("track-video-v1", "video", "Video V1", 0),
    createTrack("track-video-v2", "video", "Video V2", 1),
    createTrack("track-audio-a1", "audio", "Audio A1", 2),
    createTrack("track-overlay-o1", "overlay", "Graphics O1", 3)
  ]
}

export function createInitialEditingState(): EditingState {
  return {
    tracks: createDefaultTracks(),
    clips: [],
    transitions: [],
    playheadPosition: 0,
    playbackState: "idle",
    selectedClipId: null,
    timelineZoom: 1,
    playbackSpeed: 1,
    volume: 80,
    colorGrading: createDefaultColorGradingState(),
    audioState: createDefaultAudioStudioState(),
    textOverlays: createDefaultTextOverlayState()
  }
}

export function ensureEditingStateDefaults(state?: Partial<EditingState> | null): EditingState {
  const defaults = createInitialEditingState()
  if (!state) return defaults
  return {
    ...defaults,
    ...state,
    tracks: state.tracks ?? defaults.tracks,
    clips: state.clips ?? defaults.clips,
    transitions: state.transitions ?? defaults.transitions,
    colorGrading: state.colorGrading ?? defaults.colorGrading,
    audioState: state.audioState ?? defaults.audioState,
    textOverlays: state.textOverlays ?? defaults.textOverlays
  }
}

export function createDefaultColorGradingState(): ColorGradingState {
  const neutralWheel = { hue: 0, saturation: 0, luminance: 0 }
  const createNeutralCurve = () => [
    { id: "point-0", x: 0, y: 1 },
    { id: "point-1", x: 1, y: 0 }
  ]
  return {
    lift: { ...neutralWheel },
    gamma: { ...neutralWheel },
    gain: { ...neutralWheel },
    curves: {
      master: createNeutralCurve(),
      red: createNeutralCurve(),
      green: createNeutralCurve(),
      blue: createNeutralCurve()
    },
    lut: {
      name: "Natural",
      intensity: 0
    },
    manual: {
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      saturation: 0,
      temperature: 6500,
      tint: 0,
      filmGrain: 0,
      vignette: 0
    },
    activeScope: "waveform",
    previewMode: "split"
  }
}

export function createDefaultAudioStudioState(): AudioStudioState {
  return {
    musicTracks: [],
    sfx: [],
    voiceovers: [],
    mixer: {
      volumeAutomation: 50,
      pan: 0,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      reverb: 0,
      compression: 0,
      ducking: 0
    }
  }
}

export function createDefaultTextOverlayState(): TextOverlayState {
  return { clips: [] }
}

export function createDefaultTextOverlayClip(clipId: string, text = "Title text"): TextOverlayClip {
  return {
    clipId,
    text,
    fontFamily: "Syne",
    customFont: "",
    size: 56,
    color: "#f0f0f0",
    opacity: 100,
    alignment: "center",
    animation: "None",
    animationDuration: 0.6,
    safeAreaSnapping: true
  }
}

export function createTrack(id: string, type: TimelineTrackType, name: string, order: number): TimelineTrack {
  return {
    id,
    type,
    name,
    muted: false,
    solo: false,
    locked: false,
    expanded: true,
    order
  }
}

export function clipTypeFromMedia(media: GeneratedMedia): TimelineClipType {
  if (media.type === "audio") return "audio"
  if (media.type === "video") return "video"
  return "image"
}

export function createClipFromMedia(media: GeneratedMedia, trackId: string, start: number, duration = DEFAULT_CLIP_DURATION): TimelineClip {
  const type = clipTypeFromMedia(media)
  return createTimelineClip({
    id: `clip-${media.id}-${Date.now()}`,
    trackId,
    mediaId: media.id,
    assetId: media.assetId,
    source: media.source,
    type,
    name: media.prompt || `${type.toUpperCase()} ${media.id.slice(-4)}`,
    start,
    duration,
    url: media.url,
    thumbnailUrl: media.type === "image" ? media.url : undefined
  })
}

export function createTimelineClip(input: Partial<TimelineClip> & Pick<TimelineClip, "id" | "trackId" | "type" | "name">): TimelineClip {
  const duration = Math.max(MIN_CLIP_DURATION, input.duration ?? DEFAULT_CLIP_DURATION)
  return {
    ...input,
    start: Math.max(0, input.start ?? 0),
    duration,
    inPoint: input.inPoint ?? 0,
    outPoint: input.outPoint ?? duration,
    speed: input.speed ?? 1,
    opacity: input.opacity ?? 100,
    volume: input.volume ?? 80,
    pan: input.pan ?? 0,
    fadeIn: input.fadeIn ?? 0,
    fadeOut: input.fadeOut ?? 0,
    position: input.position ?? { x: 0, y: 0 },
    scale: input.scale ?? 100,
    rotation: input.rotation ?? 0,
    flipX: input.flipX ?? false,
    flipY: input.flipY ?? false,
    blendMode: input.blendMode ?? "normal"
  }
}

export function addClip(clips: TimelineClip[], clip: TimelineClip) {
  return [...clips, clip].sort(sortClips)
}

export function updateClip(clips: TimelineClip[], clipId: string, patch: Partial<TimelineClip>) {
  return clips.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip)).sort(sortClips)
}

export function deleteClip(clips: TimelineClip[], clipId: string) {
  return clips.filter((clip) => clip.id !== clipId)
}

export function duplicateClip(clips: TimelineClip[], clipId: string) {
  const source = clips.find((clip) => clip.id === clipId)
  if (!source) return clips
  return addClip(clips, {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} Copy`,
    start: source.start + source.duration + 0.25
  })
}

export function splitClip(clips: TimelineClip[], clipId: string, position: number) {
  const source = clips.find((clip) => clip.id === clipId)
  if (!source) return clips

  const splitOffset = position - source.start
  if (splitOffset <= 0 || splitOffset >= source.duration) return clips

  const left: TimelineClip = {
    ...source,
    duration: splitOffset,
    outPoint: source.inPoint + splitOffset
  }
  const rightDuration = source.duration - splitOffset
  const right: TimelineClip = {
    ...source,
    id: `${source.id}-split-${Date.now()}`,
    name: `${source.name} Split`,
    start: position,
    duration: rightDuration,
    inPoint: source.inPoint + splitOffset,
    outPoint: source.outPoint
  }

  return [...clips.filter((clip) => clip.id !== clipId), left, right].sort(sortClips)
}

export function moveClip(clips: TimelineClip[], tracks: TimelineTrack[], clipId: string, trackId: string, start: number) {
  const track = tracks.find((item) => item.id === trackId)
  if (!track || track.locked) return clips
  const source = clips.find((clip) => clip.id === clipId)
  const duration = source?.duration ?? DEFAULT_CLIP_DURATION
  return updateClip(clips, clipId, { trackId, start: resolveClipStart(clips, clipId, trackId, Math.max(0, start), duration) })
}

export function trimClip(clips: TimelineClip[], clipId: string, edge: "start" | "end", position: number) {
  const source = clips.find((clip) => clip.id === clipId)
  if (!source) return clips
  const siblings = clips.filter((clip) => clip.id !== clipId && clip.trackId === source.trackId)
  const previousEnd = siblings
    .filter((clip) => clip.start + clip.duration <= source.start)
    .reduce((end, clip) => Math.max(end, clip.start + clip.duration), 0)
  const nextStart = siblings
    .filter((clip) => clip.start >= source.start + source.duration)
    .reduce((start, clip) => Math.min(start, clip.start), Number.POSITIVE_INFINITY)

  return clips.map((clip) => {
    if (clip.id !== clipId) return clip
    if (edge === "start") {
      const snapped = snapTime(position, siblingSnapCandidates(siblings))
      const minimumStart = previousEnd > 0 ? previousEnd + CLIP_GAP : 0
      const nextStart = Math.max(minimumStart, Math.min(snapped, clip.start + clip.duration - MIN_CLIP_DURATION))
      const delta = nextStart - clip.start
      return {
        ...clip,
        start: nextStart,
        duration: clip.duration - delta,
        inPoint: clip.inPoint + delta
      }
    }

    const snapped = snapTime(position, siblingSnapCandidates(siblings))
    const maxEnd = Number.isFinite(nextStart) ? nextStart - CLIP_GAP : Number.POSITIVE_INFINITY
    const nextEnd = Math.min(maxEnd, Math.max(clip.start + MIN_CLIP_DURATION, snapped))
    return {
      ...clip,
      duration: nextEnd - clip.start,
      outPoint: clip.inPoint + (nextEnd - clip.start)
    }
  })
}

export function reorderTracks(tracks: TimelineTrack[], activeId: string, overId: string) {
  const from = tracks.findIndex((track) => track.id === activeId)
  const to = tracks.findIndex((track) => track.id === overId)
  if (from < 0 || to < 0 || from === to) return tracks
  const next = [...tracks]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next.map((track, order) => ({ ...track, order }))
}

function sortClips(a: TimelineClip, b: TimelineClip) {
  return a.trackId.localeCompare(b.trackId) || a.start - b.start
}

export function resolveClipStart(clips: TimelineClip[], clipId: string, trackId: string, requestedStart: number, duration: number) {
  const siblings = clips.filter((clip) => clip.id !== clipId && clip.trackId === trackId).sort((a, b) => a.start - b.start)
  let start = snapTime(Math.max(0, requestedStart), siblingSnapCandidates(siblings))
  for (const sibling of siblings) {
    const overlaps = start < sibling.start + sibling.duration && start + duration > sibling.start
    if (overlaps) start = sibling.start + sibling.duration + CLIP_GAP
  }
  return start
}

export function snapTime(time: number, candidates: number[] = []) {
  const grid = Math.round(time / SNAP_INTERVAL) * SNAP_INTERVAL
  let snapped = Math.abs(grid - time) <= SNAP_THRESHOLD ? grid : time
  for (const candidate of candidates) {
    if (Math.abs(candidate - snapped) <= SNAP_THRESHOLD) {
      snapped = candidate
      break
    }
  }
  return Math.max(0, Number(snapped.toFixed(3)))
}

function siblingSnapCandidates(clips: TimelineClip[]) {
  return clips.flatMap((clip) => [clip.start, clip.start + clip.duration])
}

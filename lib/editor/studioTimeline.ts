export type StudioTrackKind = "video" | "audio"

export interface StudioTrack {
  id: string
  name: string
  kind: StudioTrackKind
  locked: boolean
  muted: boolean
  hidden: boolean
  solo: boolean
}

export interface StudioClip {
  id: string
  trackId: string
  name: string
  kind: "video" | "image" | "audio"
  start: number
  duration: number
  sourceUrl?: string
  thumbnailUrl?: string
  volume: number
  fadeIn: number
  fadeOut: number
  color: string
}

export interface StudioTransition { id: string; fromClipId: string; toClipId: string; type: "cut" | "dissolve" | "fade"; duration: number }
export interface StudioTimeline { tracks: StudioTrack[]; clips: StudioClip[]; transitions: StudioTransition[]; playhead: number; inPoint: number; outPoint: number; loop: boolean }

export const SNAP_SECONDS = 0.1
export const createStudioTimeline = (): StudioTimeline => ({
  tracks: [
    { id: "video-1", name: "V1 · Picture", kind: "video", locked: false, muted: false, hidden: false, solo: false },
    { id: "audio-1", name: "A1 · Production", kind: "audio", locked: false, muted: false, hidden: false, solo: false }
  ], clips: [], transitions: [], playhead: 0, inPoint: 0, outPoint: 120, loop: false
})

export function timelineDuration(timeline: StudioTimeline) { return Math.max(10, ...timeline.clips.map((clip) => clip.start + clip.duration)) }
export function snap(value: number, timeline: StudioTimeline, excludeId?: string) {
  const candidates = [0, timeline.inPoint, timeline.outPoint, ...timeline.clips.filter((clip) => clip.id !== excludeId).flatMap((clip) => [clip.start, clip.start + clip.duration])]
  const closest = candidates.reduce((result, candidate) => Math.abs(candidate - value) < Math.abs(result - value) ? candidate : result, value)
  return Math.abs(closest - value) <= SNAP_SECONDS ? closest : Math.round(value * 10) / 10
}

export function addClip(timeline: StudioTimeline, clip: StudioClip): StudioTimeline { return { ...timeline, clips: [...timeline.clips, clip] } }
export function moveClip(timeline: StudioTimeline, clipId: string, trackId: string, start: number): StudioTimeline {
  const track = timeline.tracks.find((item) => item.id === trackId)
  if (!track || track.locked) return timeline
  return { ...timeline, clips: timeline.clips.map((clip) => clip.id === clipId ? { ...clip, trackId, start: Math.max(0, snap(start, timeline, clipId)) } : clip) }
}
export function trimClip(timeline: StudioTimeline, clipId: string, edge: "start" | "end", position: number): StudioTimeline {
  return { ...timeline, clips: timeline.clips.map((clip) => {
    if (clip.id !== clipId || timeline.tracks.find((track) => track.id === clip.trackId)?.locked) return clip
    const point = Math.max(0, snap(position, timeline, clipId))
    if (edge === "start") { const end = clip.start + clip.duration; return point >= end - 0.25 ? clip : { ...clip, start: point, duration: end - point } }
    return point <= clip.start + 0.25 ? clip : { ...clip, duration: point - clip.start }
  }) }
}
export function splitClip(timeline: StudioTimeline, clipId: string, at: number): StudioTimeline {
  const clip = timeline.clips.find((item) => item.id === clipId)
  if (!clip || at <= clip.start + 0.25 || at >= clip.start + clip.duration - 0.25) return timeline
  const left = { ...clip, duration: at - clip.start }
  const right = { ...clip, id: `${clip.id}-split-${Date.now()}`, start: at, duration: clip.duration - left.duration }
  return { ...timeline, clips: timeline.clips.flatMap((item) => item.id === clipId ? [left, right] : [item]) }
}
export function rippleDelete(timeline: StudioTimeline, clipId: string): StudioTimeline {
  const target = timeline.clips.find((clip) => clip.id === clipId)
  if (!target) return timeline
  return { ...timeline, clips: timeline.clips.filter((clip) => clip.id !== clipId).map((clip) => clip.trackId === target.trackId && clip.start > target.start ? { ...clip, start: Math.max(0, clip.start - target.duration) } : clip), transitions: timeline.transitions.filter((item) => item.fromClipId !== clipId && item.toClipId !== clipId) }
}

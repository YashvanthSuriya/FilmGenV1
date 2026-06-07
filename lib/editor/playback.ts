export const TIMELINE_FPS = 24

export function clampPlayhead(position: number, duration: number) {
  return Math.min(Math.max(0, position), Math.max(0, duration))
}

export function shouldRestartPlayback(position: number, duration: number) {
  return duration > 0 && position >= duration
}

export function nextPlaybackPosition(input: {
  startedAt: number
  startPosition: number
  now: number
  speed: number
  duration: number
}) {
  const elapsedSeconds = Math.max(0, (input.now - input.startedAt) / 1000)
  return clampPlayhead(input.startPosition + elapsedSeconds * input.speed, input.duration)
}

export function formatTimecode(seconds: number, fps = TIMELINE_FPS) {
  const safeSeconds = Math.max(0, seconds)
  const totalFrames = Math.round(safeSeconds * fps)
  const frames = totalFrames % fps
  const totalSeconds = Math.floor(totalFrames / fps)
  const secs = totalSeconds % 60
  const mins = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  return [hours, mins, secs, frames].map((value) => String(value).padStart(2, "0")).join(":")
}

export function parseTimecode(timecode: string, fps = TIMELINE_FPS) {
  const parts = timecode.trim().split(":").map(Number)
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0)) return null

  const [hours, minutes, seconds, frames] = parts
  if (minutes > 59 || seconds > 59 || frames >= fps) return null

  return hours * 3600 + minutes * 60 + seconds + frames / fps
}

export function getTimelineDuration(clips: { start: number; duration: number }[]) {
  return clips.reduce((duration, clip) => Math.max(duration, clip.start + clip.duration), 0)
}

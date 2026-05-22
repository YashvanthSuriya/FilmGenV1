export function formatTimecode(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':')
}

export function estimateRuntimeFromWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(30, Math.round((words / 140) * 60))
}

import type { TimelineClip, TimelineTransition, TimelineTransitionType } from "@/lib/types"

export const transitionDefinitions: Record<TimelineTransitionType, { label: string; duration: number }> = {
  cut: { label: "Cut", duration: 0 },
  dissolve: { label: "Dissolve", duration: 0.75 },
  wipe: { label: "Wipe", duration: 0.75 },
  dipToBlack: { label: "Dip to Black", duration: 1 },
  fadeInOut: { label: "Fade In/Out", duration: 1.25 }
}

export function canApplyTransition(fromClip: TimelineClip | undefined, toClip: TimelineClip | undefined) {
  return Boolean(fromClip && toClip && fromClip.trackId === toClip.trackId && fromClip.id !== toClip.id)
}

export function applyTransition(
  transitions: TimelineTransition[],
  clips: TimelineClip[],
  fromClipId: string,
  toClipId: string,
  type: TimelineTransitionType
) {
  const fromClip = clips.find((clip) => clip.id === fromClipId)
  const toClip = clips.find((clip) => clip.id === toClipId)
  if (!canApplyTransition(fromClip, toClip)) return transitions

  const nextTransition: TimelineTransition = {
    id: `transition-${fromClipId}-${toClipId}`,
    type,
    fromClipId,
    toClipId,
    duration: transitionDefinitions[type].duration
  }

  return [...transitions.filter((transition) => transition.id !== nextTransition.id), nextTransition]
}

export function removeTransition(transitions: TimelineTransition[], transitionId: string) {
  return transitions.filter((transition) => transition.id !== transitionId)
}

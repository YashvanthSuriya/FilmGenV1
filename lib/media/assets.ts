import type { ProjectAsset, TimelineClip, TimelineTrack } from "@/lib/types"
import { createTimelineClip } from "@/lib/editing/timeline"

export function defaultTrackForAsset(asset: ProjectAsset, tracks: TimelineTrack[]) {
  const compatibleType = asset.type === "audio" ? "audio" : "video"
  return tracks.find((track) => track.type === compatibleType && !track.locked) ?? tracks.find((track) => track.type === compatibleType)
}

export function createClipFromAsset(asset: ProjectAsset, trackId: string, start: number, url?: string): TimelineClip {
  return createTimelineClip({
    id: `clip-${asset.id}-${Date.now()}`,
    assetId: asset.id,
    mediaId: `media-${asset.id}`,
    source: asset.source,
    trackId,
    type: asset.type,
    name: asset.name,
    start,
    duration: asset.duration ?? (asset.type === "video" || asset.type === "audio" ? 8 : 5),
    url: url ?? asset.url,
    thumbnailUrl: asset.thumbnailUrl ?? asset.url
  })
}

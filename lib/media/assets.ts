import type { GeneratedMedia, ProjectAsset, ProjectAssetType, StoryboardFrame, TimelineClip, TimelineTrack, WorkspaceNode } from "@/lib/types"
import { createTimelineClip } from "@/lib/editing/timeline"

export function assetTypeFromMime(mimeType: string): ProjectAssetType {
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType.startsWith("video/")) return "video"
  return "image"
}

export function createImportedAsset(file: File): ProjectAsset {
  const type = assetTypeFromMime(file.type)
  const id = `asset-import-${Date.now()}-${file.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`
  return {
    id,
    source: "import",
    type,
    name: file.name,
    createdAt: new Date().toISOString(),
    blobKey: id,
    mimeType: file.type,
    size: file.size,
    duration: type === "audio" || type === "video" ? 8 : 5
  }
}

export function createStoryboardAsset(frame: StoryboardFrame): ProjectAsset {
  return {
    id: `asset-storyboard-${frame.id}-${Date.now()}`,
    source: "storyboard",
    type: "image",
    name: frame.title,
    prompt: frame.prompt,
    thumbnailUrl: frame.imageUrl ?? frame.referenceImages[0],
    url: frame.imageUrl ?? frame.referenceImages[0],
    duration: 5,
    createdAt: new Date().toISOString(),
    storyboardFrameId: frame.id
  }
}

export function createWorkspaceAsset(node: WorkspaceNode): ProjectAsset {
  const type: ProjectAssetType = node.type === "videoOutput" ? "video" : "image"
  const name = String(node.data.label ?? (type === "video" ? "Workspace Video" : "Workspace Image"))
  const prompt = String(node.data.sourcePrompt ?? node.data.prompt ?? node.data.output ?? "")
  return {
    id: `asset-workspace-${node.id}-${Date.now()}`,
    source: "workspace",
    type,
    name,
    prompt,
    thumbnailUrl: node.data.previewUrl,
    url: node.data.previewUrl,
    duration: type === "video" ? 8 : 5,
    createdAt: new Date().toISOString(),
    workspaceNodeId: node.id
  }
}

export function assetToGeneratedMedia(asset: ProjectAsset): GeneratedMedia {
  return {
    id: `media-${asset.id}`,
    assetId: asset.id,
    type: asset.type,
    url: asset.url,
    prompt: asset.prompt ?? asset.name,
    creditsUsed: 0,
    createdAt: asset.createdAt,
    source: asset.source
  }
}

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

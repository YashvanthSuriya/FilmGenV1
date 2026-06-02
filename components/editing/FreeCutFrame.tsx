"use client"

import { useCallback, useEffect, useRef } from "react"
import { createObjectUrlForBlobKey } from "@/lib/media/indexedDb"
import { useProjectStore } from "@/lib/stores/project"
import type { ProjectAsset } from "@/lib/types"

type StudioAsset = {
  id: string
  name: string
  type: "video" | "image" | "audio"
  url: string
  duration?: number
}

type FreeCutMessage =
  | { type: "FREECUT_READY" }
  | { type: "FREECUT_EXPORT_DONE"; filename: string }

const FREECUT_SRC = "/freecut-editor/projects"

function isFreeCutMessage(data: unknown): data is FreeCutMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as { type: unknown }).type === "string" &&
    ((data as { type: string }).type === "FREECUT_READY" ||
      (data as { type: string }).type === "FREECUT_EXPORT_DONE")
  )
}

async function resolveAssetUrl(asset: ProjectAsset): Promise<string | null> {
  if (asset.url && !asset.url.startsWith("blob:__placeholder")) {
    return asset.url
  }

  if (asset.blobKey) {
    try {
      return (await createObjectUrlForBlobKey(asset.blobKey)) ?? null
    } catch {
      return null
    }
  }

  return asset.url ?? null
}

export function FreeCutFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)
  const assets = useProjectStore((state) => state.assets)

  const sendAssets = useCallback(async (targetAssets: ProjectAsset[]) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) {
      return
    }

    const resolved: StudioAsset[] = []
    for (const asset of targetAssets) {
      const url = await resolveAssetUrl(asset)
      if (!url) {
        continue
      }

      resolved.push({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        url,
        duration: asset.duration,
      })
    }

    iframe.contentWindow.postMessage({ type: "STUDIO_ASSETS", assets: resolved }, "*")
  }, [])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isFreeCutMessage(event.data)) {
        return
      }

      if (event.data.type === "FREECUT_READY") {
        readyRef.current = true
        sendAssets(assets).catch(console.error)
        return
      }

      if (event.data.type === "FREECUT_EXPORT_DONE") {
        console.log("[Cine Studio] FreeCut export complete:", event.data.filename)
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [assets, sendAssets])

  useEffect(() => {
    if (readyRef.current) {
      sendAssets(assets).catch(console.error)
    }
  }, [assets, sendAssets])

  const onIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "STUDIO_HANDSHAKE" }, "*")
  }, [])

  return (
    <main className="h-[calc(100vh-var(--nav-height))] overflow-hidden bg-background">
      <iframe
        ref={iframeRef}
        src={FREECUT_SRC}
        onLoad={onIframeLoad}
        className="h-full w-full border-0"
        title="FreeCut Editor"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  )
}

import type { MediaAsset, StylePackImage } from '../domain/types'
import { createId } from './ids'

const palette = [
  ['#0d0f14', '#2dd4bf', '#f59e0b'],
  ['#101827', '#ef4444', '#f8fafc'],
  ['#140f2d', '#38bdf8', '#f472b6'],
  ['#18110b', '#facc15', '#fb7185'],
]

function pickPalette(seed: string) {
  const value = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return palette[value % palette.length]
}

function svgBlob(markup: string) {
  return new Blob([markup], { type: 'image/svg+xml' })
}

function objectUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}

export function createPosterImage(prompt: string, label: string) {
  const [bg, accent, warm] = pickPalette(prompt)
  const safePrompt = prompt.replace(/[<>&]/g, '')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="0.55" stop-color="#111827"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#g)"/>
      <circle cx="980" cy="130" r="180" fill="${warm}" opacity="0.18"/>
      <rect x="72" y="70" width="1136" height="580" rx="28" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
      <text x="96" y="145" fill="${accent}" font-family="Inter,Arial" font-size="32" font-weight="700">${label}</text>
      <text x="96" y="320" fill="white" font-family="Inter,Arial" font-size="52" font-weight="800">${safePrompt.slice(0, 34)}</text>
      <text x="96" y="382" fill="rgba(255,255,255,.72)" font-family="Inter,Arial" font-size="28">${safePrompt.slice(34, 92)}</text>
      <text x="96" y="604" fill="rgba(255,255,255,.48)" font-family="Inter,Arial" font-size="22">CINE STUDIO MOCK GENERATION</text>
    </svg>`
  const blob = svgBlob(svg)
  return { blob, url: objectUrl(blob) }
}

export function createStylePackImage(row: StylePackImage['row'], prompt: string): StylePackImage {
  const image = createPosterImage(prompt, row.toUpperCase())

  return {
    id: createId('style'),
    row,
    prompt,
    url: image.url,
  }
}

export function createVideoPlaceholder(input: {
  prompt: string
  resolution: string
  cameraPreset: string
  durationSeconds?: number
}): { asset: MediaAsset; blob: Blob } {
  const image = createPosterImage(
    `${input.cameraPreset}: ${input.prompt}`,
    `${input.resolution} CLIP`,
  )

  return {
    blob: image.blob,
    asset: {
      id: createId('asset'),
      kind: 'video',
      name: `${input.cameraPreset} generated shot`,
      url: image.url,
      mimeType: image.blob.type,
      durationSeconds: input.durationSeconds ?? 5,
      thumbnailUrl: image.url,
      createdAt: new Date().toISOString(),
      source: 'generated',
      prompt: input.prompt,
    },
  }
}

export function createAudioPlaceholder(input: {
  mood: string
  durationSeconds: number
}): { asset: MediaAsset; blob: Blob } {
  const blob = new Blob(
    [`Cine Studio mock audio track\nMood: ${input.mood}\nDuration: ${input.durationSeconds}s`],
    { type: 'text/plain' },
  )

  return {
    blob,
    asset: {
      id: createId('asset'),
      kind: 'audio',
      name: `${input.mood} score bed`,
      url: objectUrl(blob),
      mimeType: blob.type,
      durationSeconds: input.durationSeconds,
      createdAt: new Date().toISOString(),
      source: 'generated',
      prompt: input.mood,
    },
  }
}

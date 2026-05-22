import type {
  GenerateMusicInput,
  GenerateScriptInput,
  GenerateStyleImageInput,
  GenerateVideoClipInput,
  GenerationProgress,
  GenerationProvider,
  MediaAsset,
  Scene,
} from '../domain/types'
import { createId } from '../lib/ids'
import {
  createAudioPlaceholder,
  createStylePackImage,
  createVideoPlaceholder,
} from '../lib/mediaFactory'
import { BrowserStorageProvider } from './storageProvider'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockGenerationProvider implements GenerationProvider {
  private readonly cancelled = new Set<string>()
  private readonly storage = new BrowserStorageProvider()

  async generateScript(
    input: GenerateScriptInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<Scene[]> {
    const jobId = createId('job')
    await this.progress(jobId, onProgress)

    return [0, 1, 2].map((index) => ({
      id: createId('scene'),
      heading: `INT. ${input.genre.toUpperCase()} STAGE ${index + 1} - NIGHT`,
      action: `${input.idea} unfolds as a controlled cinematic beat with a clear visual objective.`,
      dialogue: index === 1 ? 'LEAD\nWe only get one take. Make it count.' : '',
      durationSeconds: 35 + index * 10,
    }))
  }

  async generateStyleImage(
    input: GenerateStyleImageInput,
    onProgress?: (progress: GenerationProgress) => void,
  ) {
    const jobId = createId('job')
    await this.progress(jobId, onProgress)
    return createStylePackImage(input.row, input.prompt)
  }

  async generateVideoClip(
    input: GenerateVideoClipInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<MediaAsset> {
    const jobId = createId('job')
    await this.progress(jobId, onProgress, 7)
    const { asset, blob } = createVideoPlaceholder({
      prompt: input.prompt,
      cameraPreset: input.cameraPreset,
      resolution: input.resolution,
    })
    const stored = await this.storage.saveBlob(blob, `${asset.id}.svg`)

    return {
      ...asset,
      storageKey: stored.storageKey,
      url: stored.url,
      thumbnailUrl: stored.url,
    }
  }

  async generateMusicTrack(
    input: GenerateMusicInput,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<MediaAsset> {
    const jobId = createId('job')
    await this.progress(jobId, onProgress, 5)
    const { asset, blob } = createAudioPlaceholder(input)
    const stored = await this.storage.saveBlob(blob, `${asset.id}.txt`)
    return { ...asset, storageKey: stored.storageKey, url: stored.url }
  }

  cancelJob(jobId: string) {
    this.cancelled.add(jobId)
  }

  private async progress(
    jobId: string,
    onProgress?: (progress: GenerationProgress) => void,
    steps = 4,
  ) {
    for (let step = 0; step <= steps; step += 1) {
      if (this.cancelled.has(jobId)) {
        this.cancelled.delete(jobId)
        onProgress?.({ jobId, progress: 0, status: 'cancelled' })
        throw new Error('Generation cancelled')
      }

      onProgress?.({
        jobId,
        progress: Math.round((step / steps) * 100),
        status: step === steps ? 'completed' : 'running',
      })
      await delay(110)
    }
  }
}

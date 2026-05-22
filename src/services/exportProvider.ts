import type { ExportProvider, MediaAsset, Project } from '../domain/types'
import { createId } from '../lib/ids'
import { BrowserStorageProvider } from './storageProvider'

export class BrowserExportProvider implements ExportProvider {
  private readonly storage = new BrowserStorageProvider()

  async exportProject(project: Project): Promise<MediaAsset> {
    const manifest = JSON.stringify(
      {
        project: project.name,
        scenes: project.scenes.length,
        assets: project.mediaAssets.length,
        clips: project.timelineClips.length,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    )
    const blob = new Blob([manifest], { type: 'application/json' })
    const id = createId('export')
    const stored = await this.storage.saveBlob(blob, `${id}.json`)

    return {
      id,
      kind: 'video',
      name: `${project.name} export manifest`,
      url: stored.url,
      mimeType: blob.type,
      storageKey: stored.storageKey,
      createdAt: new Date().toISOString(),
      source: 'generated',
    }
  }
}

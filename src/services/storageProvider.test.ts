import { describe, expect, it } from 'vitest'
import type { Project } from '../domain/types'
import { BrowserStorageProvider } from './storageProvider'

describe('BrowserStorageProvider manifests', () => {
  it('saves and loads a project manifest through localStorage fallback', async () => {
    const provider = new BrowserStorageProvider()
    const project: Project = {
      id: 'project_test',
      name: 'Manifest Test',
      scenes: [],
      stylePack: { id: 'stylepack_test', name: 'Test', images: [] },
      mediaAssets: [],
      timelineClips: [],
      updatedAt: '2026-05-22T00:00:00.000Z',
    }

    await provider.saveProjectManifest(project)
    await expect(provider.loadProjectManifest(project.id)).resolves.toMatchObject({
      id: project.id,
      name: project.name,
    })
  })
})

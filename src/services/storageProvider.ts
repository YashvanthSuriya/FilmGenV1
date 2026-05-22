import type { Project, StorageProvider } from '../domain/types'

const DB_NAME = 'cine-studio-local-mvp'
const STORE_NAME = 'blobs'
const MANIFEST_PREFIX = 'cine-studio-project:'

function openBlobDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
  })
}

async function idbPut(key: string, blob: Blob) {
  const db = await openBlobDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function idbGet(key: string) {
  const db = await openBlobDb()
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return blob
}

async function idbDelete(key: string) {
  const db = await openBlobDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export class BrowserStorageProvider implements StorageProvider {
  async saveBlob(blob: Blob, name: string) {
    const storageKey = `asset/${Date.now()}-${name}`

    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory()
      const handle = await root.getFileHandle(storageKey.replaceAll('/', '-'), {
        create: true,
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    } else {
      await idbPut(storageKey, blob)
    }

    return {
      storageKey,
      url: URL.createObjectURL(blob),
    }
  }

  async readBlob(storageKey: string) {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory()
      try {
        const handle = await root.getFileHandle(storageKey.replaceAll('/', '-'))
        return await handle.getFile()
      } catch {
        return undefined
      }
    }

    return idbGet(storageKey)
  }

  async deleteAsset(storageKey: string) {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory()
      await root.removeEntry(storageKey.replaceAll('/', '-')).catch(() => undefined)
      return
    }

    await idbDelete(storageKey)
  }

  async saveProjectManifest(project: Project) {
    localStorage.setItem(`${MANIFEST_PREFIX}${project.id}`, JSON.stringify(project))
  }

  async loadProjectManifest(projectId: string) {
    const raw = localStorage.getItem(`${MANIFEST_PREFIX}${projectId}`)
    if (!raw) return undefined
    return JSON.parse(raw) as Project
  }
}

const DB_NAME = "filmgen-local-media"
const STORE_NAME = "blobs"
const DB_VERSION = 1

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined"
}

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is unavailable in this browser."))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    request.onerror = () => reject(request.error ?? new Error("Failed to open media storage."))
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveBlobForAsset(blobKey: string, blob: Blob) {
  const db = await openMediaDb()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    transaction.objectStore(STORE_NAME).put(blob, blobKey)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error("Failed to save media blob."))
  })
  db.close()
}

export async function loadBlobForAsset(blobKey: string) {
  const db = await openMediaDb()
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const request = transaction.objectStore(STORE_NAME).get(blobKey)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
    request.onerror = () => reject(request.error ?? new Error("Failed to load media blob."))
  })
  db.close()
  return blob
}

export async function createObjectUrlForBlobKey(blobKey?: string) {
  if (!blobKey) return undefined
  const blob = await loadBlobForAsset(blobKey)
  return blob ? URL.createObjectURL(blob) : undefined
}

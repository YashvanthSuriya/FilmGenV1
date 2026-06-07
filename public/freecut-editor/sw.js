const CACHE_VERSION = 'freecut-app-shell-v1'
const APP_SHELL_URLS = [
  '/freecut-editor/',
  '/freecut-editor/index.html',
  '/freecut-editor/favicon.svg',
  '/freecut-editor/manifest.webmanifest',
  '/freecut-editor/icons/icon-192.png',
  '/freecut-editor/icons/icon-512.png',
  '/freecut-editor/icons/icon-maskable-512.png',
]
const CACHEABLE_DESTINATIONS = new Set(['document', 'script', 'style', 'font', 'image'])
const APP_SCOPE = '/freecut-editor/'
const OFFLINE_FALLBACK_URL = '/freecut-editor/index.html'
const EXCLUDED_PATH_PREFIXES = ['/freecut-editor/moss-tts/']
const MAX_DYNAMIC_CACHE_ENTRIES = 160

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(APP_SHELL_URLS)
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName !== CACHE_VERSION)
              .map((cacheName) => caches.delete(cacheName)),
          ),
        ),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (!url.pathname.startsWith(APP_SCOPE)) {
    return
  }

  if (EXCLUDED_PATH_PREFIXES.some((pathPrefix) => url.pathname.startsWith(pathPrefix))) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  if (!CACHEABLE_DESTINATIONS.has(request.destination)) {
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_VERSION)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(OFFLINE_FALLBACK_URL, response.clone())
    }
    return response
  } catch {
    return (await cache.match(OFFLINE_FALLBACK_URL)) ?? Response.error()
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache
          .put(request, response.clone())
          .then(() => trimRuntimeCache(cache))
          .catch(() => {})
      }
      return response
    })
    .catch((error) => {
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    })

  return cachedResponse ?? fetchPromise
}

async function trimRuntimeCache(cache) {
  const requests = await cache.keys()
  const dynamicRequests = requests.filter((request) => {
    const url = new URL(request.url)
    return !APP_SHELL_URLS.includes(url.pathname)
  })
  const deleteCount = dynamicRequests.length - MAX_DYNAMIC_CACHE_ENTRIES
  if (deleteCount <= 0) {
    return
  }

  await Promise.all(dynamicRequests.slice(0, deleteCount).map((request) => cache.delete(request)))
}

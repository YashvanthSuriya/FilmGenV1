interface RateLimitBucket {
  count: number
  resetAt: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

const buckets = new Map<string, RateLimitBucket>()

function createFixedWindowLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  return {
    limit(identifier: string): RateLimitResult {
      const now = Date.now()
      const bucket = buckets.get(identifier)
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(identifier, { count: 1, resetAt: now + windowMs })
        return { success: true, remaining: limit - 1, resetAt: now + windowMs }
      }

      if (bucket.count >= limit) {
        return { success: false, remaining: 0, resetAt: bucket.resetAt }
      }

      bucket.count += 1
      return { success: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt }
    }
  }
}

export const generationRateLimit = createFixedWindowLimiter({ limit: 3, windowMs: 60_000 })


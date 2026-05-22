import type { CreditFeature } from '../domain/types'

export const CREDIT_PRICES: Record<CreditFeature, number> = {
  'script-generation': 2,
  'style-image': 1,
  'video-720p': 10,
  'video-1080p': 25,
  'video-4k': 60,
  'music-track': 5,
  voiceover: 3,
}

export function getCreditPrice(feature: CreditFeature) {
  return CREDIT_PRICES[feature]
}

export function videoFeatureForResolution(resolution: '720p' | '1080p' | '4K') {
  if (resolution === '4K') return 'video-4k'
  if (resolution === '1080p') return 'video-1080p'
  return 'video-720p'
}

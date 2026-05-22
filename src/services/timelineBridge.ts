export interface TimelineBridgeStatus {
  registered: boolean
  availableElements: string[]
  error?: string
}

let registrationPromise: Promise<TimelineBridgeStatus> | undefined

export function registerOmniclipElements(): Promise<TimelineBridgeStatus> {
  if (registrationPromise) return registrationPromise

  registrationPromise = Promise.resolve({
      registered: false,
      availableElements: ['omni-media', 'omni-timeline', 'omni-text'],
      error:
        'Omniclip is installed, but its current package export map pulls blocked deep dependencies in Vite. The bridge is isolated for the fork/export-map fix.',
    })

  return registrationPromise
}

export const timelineActions = [
  'Import media from Cine Studio bin',
  'Arrange generated video and audio clips',
  'Trim and split through Omniclip timeline tools',
  'Export through Cine Studio mock export provider',
]

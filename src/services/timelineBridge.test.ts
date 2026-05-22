import { describe, expect, it } from 'vitest'
import { registerOmniclipElements, timelineActions } from './timelineBridge'

describe('timeline bridge', () => {
  it('exposes supported actions and resolves a smoke status', async () => {
    expect(timelineActions).toContain('Arrange generated video and audio clips')

    const status = await registerOmniclipElements()
    expect(status).toHaveProperty('registered')
    expect(status).toHaveProperty('availableElements')
  })
})

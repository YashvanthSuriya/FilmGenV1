import { describe, expect, it } from 'vitest'
import { estimateRuntimeFromWords, formatTimecode } from './timecode'

describe('timecode helpers', () => {
  it('formats seconds as hh:mm:ss', () => {
    expect(formatTimecode(0)).toBe('00:00:00')
    expect(formatTimecode(75)).toBe('00:01:15')
    expect(formatTimecode(3671)).toBe('01:01:11')
  })

  it('estimates runtime with a useful lower bound', () => {
    expect(estimateRuntimeFromWords('one two three')).toBe(30)
    expect(estimateRuntimeFromWords(Array.from({ length: 280 }, () => 'word').join(' '))).toBe(120)
  })
})

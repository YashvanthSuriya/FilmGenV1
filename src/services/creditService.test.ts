import { describe, expect, it } from 'vitest'
import { LocalCreditService } from './creditService'

describe('LocalCreditService', () => {
  it('reserves, commits, and lists credit transactions', () => {
    const service = new LocalCreditService({ balance: 12, transactions: [] })
    const reservation = service.reserveCredits('video-720p', 'Test clip')
    const commit = service.commitCredits(reservation.id)

    expect(service.getBalance()).toBe(2)
    expect(commit?.kind).toBe('commit')
    expect(service.listTransactions()).toHaveLength(2)
  })

  it('refunds reservations when generation fails', () => {
    const service = new LocalCreditService({ balance: 10, transactions: [] })
    const reservation = service.reserveCredits('music-track', 'Score')
    service.refundCredits(reservation.id, 'Generation failed')

    expect(service.getBalance()).toBe(10)
    expect(service.listTransactions()[0]).toMatchObject({
      kind: 'refund',
      amount: 5,
    })
  })

  it('blocks unaffordable generation', () => {
    const service = new LocalCreditService({ balance: 1, transactions: [] })
    expect(service.canAfford('video-1080p')).toBe(false)
    expect(() => service.reserveCredits('video-1080p', 'Too expensive')).toThrow(
      'Insufficient credits',
    )
  })
})

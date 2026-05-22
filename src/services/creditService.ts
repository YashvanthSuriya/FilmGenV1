import type { CreditFeature, CreditService, CreditTransaction } from '../domain/types'
import { getCreditPrice } from '../lib/creditPricing'
import { createId } from '../lib/ids'

export interface CreditLedgerSnapshot {
  balance: number
  transactions: CreditTransaction[]
}

export class LocalCreditService implements CreditService {
  private balance: number
  private readonly transactions: CreditTransaction[]

  constructor(snapshot?: Partial<CreditLedgerSnapshot>) {
    this.balance = snapshot?.balance ?? 50
    this.transactions = snapshot?.transactions ?? [
      {
        id: createId('tx'),
        kind: 'grant',
        feature: 'script-generation',
        amount: 50,
        description: 'Free monthly MVP credit grant',
        createdAt: new Date().toISOString(),
      },
    ]
  }

  getBalance() {
    return this.balance
  }

  canAfford(feature: CreditFeature) {
    return this.balance >= getCreditPrice(feature)
  }

  reserveCredits(feature: CreditFeature, description: string) {
    const amount = getCreditPrice(feature)

    if (this.balance < amount) {
      throw new Error(`Insufficient credits for ${feature}`)
    }

    this.balance -= amount
    const transaction = this.createTransaction('reserve', feature, -amount, description)
    this.transactions.unshift(transaction)
    return transaction
  }

  commitCredits(reservationId: string) {
    const reservation = this.transactions.find((tx) => tx.id === reservationId)
    if (!reservation) return undefined

    const transaction = this.createTransaction(
      'commit',
      reservation.feature,
      0,
      `Committed ${reservation.description}`,
      reservationId,
    )
    this.transactions.unshift(transaction)
    return transaction
  }

  refundCredits(reservationId: string, description: string) {
    const reservation = this.transactions.find((tx) => tx.id === reservationId)
    if (!reservation) {
      throw new Error(`Missing reservation ${reservationId}`)
    }

    const amount = Math.abs(reservation.amount)
    this.balance += amount
    const transaction = this.createTransaction(
      'refund',
      reservation.feature,
      amount,
      description,
      reservationId,
    )
    this.transactions.unshift(transaction)
    return transaction
  }

  listTransactions() {
    return [...this.transactions]
  }

  snapshot(): CreditLedgerSnapshot {
    return {
      balance: this.balance,
      transactions: this.listTransactions(),
    }
  }

  private createTransaction(
    kind: CreditTransaction['kind'],
    feature: CreditFeature,
    amount: number,
    description: string,
    reservationId?: string,
  ): CreditTransaction {
    return {
      id: createId('tx'),
      kind,
      feature,
      amount,
      description,
      reservationId,
      createdAt: new Date().toISOString(),
    }
  }
}

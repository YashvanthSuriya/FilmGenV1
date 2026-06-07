export interface CheckoutResult {
  checkoutUrl: string;
}

export interface PaymentProvider {
  createSubscriptionCheckout(plan: string, billingCycle?: string): Promise<CheckoutResult>;
  createCreditCheckout(packId: string): Promise<CheckoutResult>;
}

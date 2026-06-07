import { PaymentProvider, CheckoutResult } from "./types";

export const paddleProvider: PaymentProvider = {
  async createSubscriptionCheckout(plan: string, billingCycle = "monthly"): Promise<CheckoutResult> {
    // STUB: Will call Paddle SDK in backend phase
    console.log("[STUB] Paddle subscription checkout", { plan, billingCycle });
    return { checkoutUrl: "#" };
  },
  async createCreditCheckout(packId: string): Promise<CheckoutResult> {
    console.log("[STUB] Paddle credit checkout", { packId });
    return { checkoutUrl: "#" };
  },
};

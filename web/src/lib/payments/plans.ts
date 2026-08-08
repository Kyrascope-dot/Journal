export type PaymentPlanId = "international_usd" | "indian_inr";

export type PaymentPlan = {
  id: PaymentPlanId;
  label: string;
  description: string;
  /** ISO currency code accepted by Razorpay */
  currency: "USD" | "INR";
  /** Major units (e.g. 200 for USD 200) */
  amountMajor: number;
  /** Smallest currency unit for Razorpay (cents / paise) */
  amountMinor: number;
  displayAmount: string;
};

/**
 * Server-authoritative conference fee plans.
 * Never trust client-supplied amounts — always resolve via plan id.
 */
export const CONFERENCE_PAYMENT_PLANS: Record<PaymentPlanId, PaymentPlan> = {
  international_usd: {
    id: "international_usd",
    label: "International Participants",
    description: "Conference registration fee for international participants",
    currency: "USD",
    amountMajor: 200,
    amountMinor: 20000,
    displayAmount: "USD 200",
  },
  indian_inr: {
    id: "indian_inr",
    label: "Indian Participants",
    description: "Conference registration fee for Indian participants",
    currency: "INR",
    amountMajor: 14500,
    amountMinor: 1_450_000,
    displayAmount: "₹14,500",
  },
};

export function getPaymentPlan(planId: string | null | undefined): PaymentPlan | null {
  if (!planId) return null;
  if (planId === "international_usd" || planId === "indian_inr") {
    return CONFERENCE_PAYMENT_PLANS[planId];
  }
  return null;
}

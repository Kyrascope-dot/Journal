export type PaymentPlanId = "international_usd" | "national_usd" | "gateway_test_usd";

export type PaymentPlan = {
  id: PaymentPlanId;
  label: string;
  description: string;
  /** ISO currency code accepted by Razorpay */
  currency: "USD";
  /** Major units (e.g. 200 for USD 200) */
  amountMajor: number;
  /** Smallest currency unit for Razorpay (cents) */
  amountMinor: number;
  displayAmount: string;
};

/** USD 1 plan for Razorpay gateway testing only. */
export const GATEWAY_TEST_PAYMENT_PLAN: PaymentPlan = {
  id: "gateway_test_usd",
  label: "Gateway test",
  description: "One-dollar test charge to verify Razorpay checkout",
  currency: "USD",
  amountMajor: 1,
  amountMinor: 100,
  displayAmount: "USD 1",
};

/**
 * Server-authoritative conference fee plans.
 * Never trust client-supplied amounts — resolve via plan id only.
 */
export const CONFERENCE_PAYMENT_PLANS: Record<
  Exclude<PaymentPlanId, "gateway_test_usd">,
  PaymentPlan
> = {
  national_usd: {
    id: "national_usd",
    label: "National Participants",
    description: "Conference registration fee for national participants",
    currency: "USD",
    amountMajor: 150,
    amountMinor: 15000,
    displayAmount: "USD 150",
  },
  international_usd: {
    id: "international_usd",
    label: "International Participants",
    description: "Conference registration fee for international participants",
    currency: "USD",
    amountMajor: 200,
    amountMinor: 20000,
    displayAmount: "USD 200",
  },
};

/** Legacy plan id from earlier INR checkout — maps to national USD 150. */
const LEGACY_PLAN_ALIASES: Record<string, PaymentPlanId> = {
  indian_inr: "national_usd",
};

/** True in local dev, or when ENABLE_PAYMENT_TEST_PAGE=true on the server. */
export function isPaymentTestPageEnabled(): boolean {
  return (
    process.env.ENABLE_PAYMENT_TEST_PAGE === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function isGatewayTestPlan(planId: string | null | undefined): boolean {
  return planId === "gateway_test_usd";
}

export function getPaymentPlan(planId: string | null | undefined): PaymentPlan | null {
  if (!planId) return null;
  const resolved = (LEGACY_PLAN_ALIASES[planId] ?? planId) as PaymentPlanId;

  if (resolved === "gateway_test_usd") {
    return isPaymentTestPageEnabled() ? GATEWAY_TEST_PAYMENT_PLAN : null;
  }

  if (resolved === "international_usd" || resolved === "national_usd") {
    return CONFERENCE_PAYMENT_PLANS[resolved];
  }
  return null;
}

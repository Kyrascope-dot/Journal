export type PaymentPlanId =
  | "international_usd"
  | "national_usd"
  | "fee_waiver_usd"
  | "tech_research_usd"
  | "gateway_test_usd";

export type PaymentPlan = {
  id: PaymentPlanId;
  label: string;
  description: string;
  /** ISO currency code sent to Razorpay */
  currency: "USD";
  /** Major units (e.g. 200 for USD 200) */
  amountMajor: number;
  /** Smallest currency unit for Razorpay (cents) */
  amountMinor: number;
  displayAmount: string;
  checkoutHint: string;
};

/** USD 5 plan for Razorpay gateway testing only. */
export const GATEWAY_TEST_PAYMENT_PLAN: PaymentPlan = {
  id: "gateway_test_usd",
  label: "Gateway test",
  description: "Five-dollar test charge to verify Razorpay checkout",
  currency: "USD",
  amountMajor: 5,
  amountMinor: 500,
  displayAmount: "USD 5",
  checkoutHint: "Uses USD checkout. International cards require Razorpay International Payments.",
};

/** Tech Research Hub submission fee (USD). */
export const TECH_RESEARCH_PAYMENT_PLAN: PaymentPlan = {
  id: "tech_research_usd",
  label: "Tech Research submission",
  description: "GCR Tech Research Hub editorial review submission fee",
  currency: "USD",
  amountMajor: 80,
  amountMinor: 8000,
  displayAmount: "USD 80",
  checkoutHint: "Required to complete your Tech Research application.",
};

/** 18% GST applies to National (India) conference registration only. */
export const NATIONAL_CONFERENCE_GST_RATE = 0.18;

export type PaymentCheckoutBreakdown = {
  planId: PaymentPlanId;
  currency: "USD";
  baseAmountMajor: number;
  baseAmountMinor: number;
  gstRate: number | null;
  gstAmountMajor: number;
  gstAmountMinor: number;
  totalAmountMajor: number;
  totalAmountMinor: number;
  displayBaseAmount: string;
  displayGstAmount: string | null;
  displayTotalAmount: string;
  displaySummary: string;
};

function formatUsdMajor(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `USD ${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2)}`;
}

export function getPaymentCheckoutBreakdown(
  planId: PaymentPlanId | string | null | undefined
): PaymentCheckoutBreakdown | null {
  const plan = getPaymentPlan(planId);
  if (!plan) return null;

  if (plan.id === "national_usd") {
    const baseAmountMajor = plan.amountMajor;
    const gstAmountMajor =
      Math.round(baseAmountMajor * NATIONAL_CONFERENCE_GST_RATE * 100) / 100;
    const totalAmountMajor =
      Math.round((baseAmountMajor + gstAmountMajor) * 100) / 100;
    const baseAmountMinor = baseAmountMajor * 100;
    const gstAmountMinor = Math.round(gstAmountMajor * 100);
    const totalAmountMinor = baseAmountMinor + gstAmountMinor;

    return {
      planId: plan.id,
      currency: "USD",
      baseAmountMajor,
      baseAmountMinor,
      gstRate: NATIONAL_CONFERENCE_GST_RATE,
      gstAmountMajor,
      gstAmountMinor,
      totalAmountMajor,
      totalAmountMinor,
      displayBaseAmount: formatUsdMajor(baseAmountMajor),
      displayGstAmount: formatUsdMajor(gstAmountMajor),
      displayTotalAmount: formatUsdMajor(totalAmountMajor),
      displaySummary: `${formatUsdMajor(baseAmountMajor)} + 18% GST (${formatUsdMajor(gstAmountMajor)}) = ${formatUsdMajor(totalAmountMajor)}`,
    };
  }

  return {
    planId: plan.id,
    currency: "USD",
    baseAmountMajor: plan.amountMajor,
    baseAmountMinor: plan.amountMinor,
    gstRate: null,
    gstAmountMajor: 0,
    gstAmountMinor: 0,
    totalAmountMajor: plan.amountMajor,
    totalAmountMinor: plan.amountMinor,
    displayBaseAmount: plan.displayAmount,
    displayGstAmount: null,
    displayTotalAmount: plan.displayAmount,
    displaySummary: plan.displayAmount,
  };
}

/** Server-authoritative conference fee plans (USD only). */
export const CONFERENCE_PAYMENT_PLANS: Record<
  Exclude<PaymentPlanId, "gateway_test_usd" | "tech_research_usd">,
  PaymentPlan
> = {
  fee_waiver_usd: {
    id: "fee_waiver_usd",
    label: "Fee Waiver Scholars",
    description: "Reduced conference registration fee for approved fee-waiver scholars",
    currency: "USD",
    amountMajor: 100,
    amountMinor: 10000,
    displayAmount: "USD 100",
    checkoutHint: "Use only if the Editorial Office has approved your fee-waiver payment.",
  },
  national_usd: {
    id: "national_usd",
    label: "National Participants",
    description: "Conference registration fee for national participants (India)",
    currency: "USD",
    amountMajor: 150,
    amountMinor: 15000,
    displayAmount: "USD 150 + 18% GST",
    checkoutHint: "For participants based in India. Total payable: USD 177 (150 + 18% GST).",
  },
  international_usd: {
    id: "international_usd",
    label: "International Participants",
    description: "Conference registration fee for international participants",
    currency: "USD",
    amountMajor: 200,
    amountMinor: 20000,
    displayAmount: "USD 200",
    checkoutHint: "For participants based outside India.",
  },
};

/** Older plan ids still stored on past payment records. */
const LEGACY_PLAN_ALIASES: Record<string, PaymentPlanId> = {
  indian_inr: "national_usd",
  national_inr: "national_usd",
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

export function isInternationalUsdPlan(planId: string | null | undefined): boolean {
  return planId === "international_usd";
}

export function isTechResearchPlan(planId: string | null | undefined): boolean {
  return planId === "tech_research_usd";
}

export function resolvePaymentPurpose(
  planId: PaymentPlanId
): "conference_registration" | "tech_research_submission" | "gateway_test" {
  if (isGatewayTestPlan(planId)) return "gateway_test";
  if (isTechResearchPlan(planId)) return "tech_research_submission";
  return "conference_registration";
}

export function getPaymentPlan(planId: string | null | undefined): PaymentPlan | null {
  if (!planId) return null;
  const resolved = (LEGACY_PLAN_ALIASES[planId] ?? planId) as PaymentPlanId;

  if (resolved === "gateway_test_usd") {
    return isPaymentTestPageEnabled() ? GATEWAY_TEST_PAYMENT_PLAN : null;
  }

  if (resolved === "tech_research_usd") {
    return TECH_RESEARCH_PAYMENT_PLAN;
  }

  if (
    resolved === "international_usd" ||
    resolved === "national_usd" ||
    resolved === "fee_waiver_usd"
  ) {
    return CONFERENCE_PAYMENT_PLANS[resolved];
  }
  return null;
}

import { NATIONAL_CONFERENCE_GST_RATE } from "./plans";

export type ManuscriptPaymentPlanId =
  | "manuscript_national_normal_inr"
  | "manuscript_national_fasttrack_inr"
  | "manuscript_international_standard_usd"
  | "manuscript_international_fasttrack_usd";

export type ManuscriptPaymentPlan = {
  id: ManuscriptPaymentPlanId;
  category: string;
  label: string;
  description: string;
  route: string;
  reviewTimeline: string;
  /** ISO currency code sent to Razorpay */
  currency: "INR" | "USD";
  /** Major units (e.g. 9995 for INR 9,995) */
  amountMajor: number;
  /** Smallest currency unit for Razorpay (paise for INR, cents for USD) */
  amountMinor: number;
  displayAmount: string;
};

/** Manuscript publication APC plans */
export const MANUSCRIPT_PAYMENT_PLANS: Record<ManuscriptPaymentPlanId, ManuscriptPaymentPlan> = {
  manuscript_national_normal_inr: {
    id: "manuscript_national_normal_inr",
    category: "For Indian Authors – National Publication",
    label: "Normal Route",
    description: "Standard review process (Within 2 months)",
    route: "normal",
    reviewTimeline: "Within 2 months",
    currency: "INR",
    amountMajor: 9995,
    amountMinor: 999500, // paise
    displayAmount: "₹9,995",
  },
  manuscript_national_fasttrack_inr: {
    id: "manuscript_national_fasttrack_inr",
    category: "For Indian Authors – National Publication",
    label: "Fast-Track Route",
    description: "Expedited review process (Within 1 week)",
    route: "fast-track",
    reviewTimeline: "Within 1 week",
    currency: "INR",
    amountMajor: 12288,
    amountMinor: 1228800, // paise
    displayAmount: "₹12,288.14",
  },
  manuscript_international_standard_usd: {
    id: "manuscript_international_standard_usd",
    category: "For International Authors",
    label: "Regular Publication",
    description: "Standard review process (Within 2 months)",
    route: "regular",
    reviewTimeline: "Within 2 months",
    currency: "USD",
    amountMajor: 150,
    amountMinor: 15000, // cents
    displayAmount: "USD 150",
  },
  manuscript_international_fasttrack_usd: {
    id: "manuscript_international_fasttrack_usd",
    category: "For International Authors",
    label: "Fast-Track Publication",
    description: "Expedited review process (Within 1 week)",
    route: "fast-track",
    reviewTimeline: "Within 1 week",
    currency: "USD",
    amountMajor: 200,
    amountMinor: 20000, // cents
    displayAmount: "USD 200",
  },
};

export type ManuscriptPaymentCheckoutBreakdown = {
  planId: ManuscriptPaymentPlanId;
  currency: "INR" | "USD";
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

function formatInrMajor(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatUsdMajor(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `USD ${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2)}`;
}

export function getManuscriptPaymentCheckoutBreakdown(
  planId: ManuscriptPaymentPlanId | string | null | undefined,
): ManuscriptPaymentCheckoutBreakdown | null {
  const plan = getManuscriptPaymentPlan(planId);
  if (!plan) return null;

  // Indian authors with 18% GST
  if (
    plan.id === "manuscript_national_normal_inr" ||
    plan.id === "manuscript_national_fasttrack_inr"
  ) {
    const baseAmountMajor = plan.amountMajor;
    const gstAmountMajor = Math.round(baseAmountMajor * NATIONAL_CONFERENCE_GST_RATE * 100) / 100;
    const totalAmountMajor = Math.round((baseAmountMajor + gstAmountMajor) * 100) / 100;
    const baseAmountMinor = baseAmountMajor * 100;
    const gstAmountMinor = Math.round(gstAmountMajor * 100);
    const totalAmountMinor = baseAmountMinor + gstAmountMinor;

    return {
      planId: plan.id,
      currency: "INR",
      baseAmountMajor,
      baseAmountMinor,
      gstRate: NATIONAL_CONFERENCE_GST_RATE,
      gstAmountMajor,
      gstAmountMinor,
      totalAmountMajor,
      totalAmountMinor,
      displayBaseAmount: formatInrMajor(baseAmountMajor),
      displayGstAmount: formatInrMajor(gstAmountMajor),
      displayTotalAmount: formatInrMajor(totalAmountMajor),
      displaySummary: `${formatInrMajor(baseAmountMajor)} + 18% GST (${formatInrMajor(gstAmountMajor)}) = ${formatInrMajor(totalAmountMajor)}`,
    };
  }

  // International authors (no GST)
  return {
    planId: plan.id,
    currency: plan.currency,
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

export function getManuscriptPaymentPlan(
  planId: string | null | undefined,
): ManuscriptPaymentPlan | null {
  if (!planId) return null;
  return MANUSCRIPT_PAYMENT_PLANS[planId as ManuscriptPaymentPlanId] || null;
}

export function isValidManuscriptPlanId(
  planId: string | null | undefined,
): planId is ManuscriptPaymentPlanId {
  return planId != null && planId in MANUSCRIPT_PAYMENT_PLANS;
}

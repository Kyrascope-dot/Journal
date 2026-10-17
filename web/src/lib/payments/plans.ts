export type PaymentPlanId =
  | "international_usd"
  | "national_usd"
  | "fee_waiver_usd"
  | "tech_research_usd"
  | "gateway_test_usd"
  | "manuscript_national_normal_inr"
  | "manuscript_national_fasttrack_inr"
  | "manuscript_international_standard_usd"
  | "manuscript_international_fasttrack_usd";

export type PaymentCurrency = "USD" | "INR";

export type PaymentPlan = {
  id: PaymentPlanId;
  label: string;
  description: string;
  currency: PaymentCurrency;
  amountMajor: number;
  amountMinor: number;
  /**
   * GST-inclusive total in minor units, when the published total is fixed
   * (so rounding never charges a paisa more or less than the fee table).
   */
  totalAmountMinor?: number;
  displayAmount: string;
  checkoutHint: string;
};

export const GATEWAY_TEST_PAYMENT_PLAN: PaymentPlan = {
  id: "gateway_test_usd",
  label: "Gateway test",
  description: "Five-dollar test charge to verify Razorpay checkout",
  currency: "USD",
  amountMajor: 5,
  amountMinor: 500,
  displayAmount: "USD 5",
  checkoutHint:
    "Uses USD checkout. International cards require Razorpay International Payments.",
};

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

export const MANUSCRIPT_PAYMENT_PLANS: Record<
  Exclude<
    PaymentPlanId,
    | "international_usd"
    | "national_usd"
    | "fee_waiver_usd"
    | "tech_research_usd"
    | "gateway_test_usd"
  >,
  PaymentPlan
> = {
  manuscript_national_normal_inr: {
    id: "manuscript_national_normal_inr",
    label: "Normal Route",
    description: "National publication – review within 2 months",
    currency: "INR",
    amountMajor: 9995,
    amountMinor: 999500,
    totalAmountMinor: 1179410,
    displayAmount: "₹9,995",
    checkoutHint: "Includes GST @ 18%. Total payable: ₹11,794.10",
  },
  manuscript_national_fasttrack_inr: {
    id: "manuscript_national_fasttrack_inr",
    label: "Fast-Track Route",
    description: "National publication – review within 1 week",
    currency: "INR",
    amountMajor: 12288.14,
    amountMinor: 1228814,
    totalAmountMinor: 1450000,
    displayAmount: "₹12,288.14",
    checkoutHint: "Includes GST @ 18%. Total payable: ₹14,500",
  },
  manuscript_international_standard_usd: {
    id: "manuscript_international_standard_usd",
    label: "Regular Publication",
    description: "International publication – review within 2 months",
    currency: "USD",
    amountMajor: 150,
    amountMinor: 15000,
    displayAmount: "USD 150",
    checkoutHint: "Review timeline: within 2 months",
  },
  manuscript_international_fasttrack_usd: {
    id: "manuscript_international_fasttrack_usd",
    label: "Fast-Track Publication",
    description: "International publication – review within 1 week",
    currency: "USD",
    amountMajor: 200,
    amountMinor: 20000,
    displayAmount: "USD 200",
    checkoutHint: "Review timeline: within 1 week",
  },
};

export const NATIONAL_CONFERENCE_GST_RATE = 0.18;

export type PaymentCheckoutBreakdown = {
  planId: PaymentPlanId;
  currency: PaymentCurrency;
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

function formatInrMajor(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  // Whole rupees without decimals; otherwise always two (₹1,799.10, not ₹1,799.1).
  const fractionDigits = Number.isInteger(rounded) ? 0 : 2;
  return `₹${rounded.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function getPaymentCheckoutBreakdown(
  planId: PaymentPlanId | string | null | undefined,
): PaymentCheckoutBreakdown | null {
  const plan = getPaymentPlan(planId);
  if (!plan) return null;

  const isIndianManuscript =
    plan.id === "manuscript_national_normal_inr" ||
    plan.id === "manuscript_national_fasttrack_inr";

  if (isIndianManuscript) {
    // Work in paise so the charged total matches the published fee table exactly.
    const baseAmountMinor = plan.amountMinor;
    const totalAmountMinor =
      plan.totalAmountMinor ??
      baseAmountMinor + Math.round(baseAmountMinor * NATIONAL_CONFERENCE_GST_RATE);
    const gstAmountMinor = totalAmountMinor - baseAmountMinor;
    const baseAmountMajor = baseAmountMinor / 100;
    const gstAmountMajor = gstAmountMinor / 100;
    const totalAmountMajor = totalAmountMinor / 100;

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

  if (plan.id === "national_usd" || plan.id === "fee_waiver_usd") {
    const baseAmountMajor = plan.amountMajor;
    const gstAmountMajor =
      Math.round(baseAmountMajor * NATIONAL_CONFERENCE_GST_RATE * 100) / 100;
    const totalAmountMajor =
      Math.round((baseAmountMajor + gstAmountMajor) * 100) / 100;
    const baseAmountMinor = Math.round(baseAmountMajor * 100);
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

export const CONFERENCE_PAYMENT_PLANS: Record<
  Exclude<
    PaymentPlanId,
    | "gateway_test_usd"
    | "tech_research_usd"
    | "manuscript_national_normal_inr"
    | "manuscript_national_fasttrack_inr"
    | "manuscript_international_standard_usd"
    | "manuscript_international_fasttrack_usd"
  >,
  PaymentPlan
> = {
  fee_waiver_usd: {
    id: "fee_waiver_usd",
    label: "Fee Waiver Scholars",
    description: "",
    currency: "USD",
    amountMajor: 100,
    amountMinor: 10000,
    displayAmount: "USD 100 + 18% GST",
    checkoutHint: "",
  },
  national_usd: {
    id: "national_usd",
    label: "National Participants",
    description: "Conference registration fee for national participants (India)",
    currency: "USD",
    amountMajor: 150,
    amountMinor: 15000,
    displayAmount: "INR 14448 + 18% GST",
    checkoutHint: "For participants based in India. Total payable: INR 177 (150 + 18% GST).",
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

export type ManuscriptPaymentPlanId = keyof typeof MANUSCRIPT_PAYMENT_PLANS;
export type ConferencePaymentPlanId = keyof typeof CONFERENCE_PAYMENT_PLANS;

/** Manuscript APC plans offered to authors, in display order. */
export const MANUSCRIPT_PLAN_IDS: ManuscriptPaymentPlanId[] = [
  "manuscript_national_normal_inr",
  "manuscript_international_standard_usd",
];

/**
 * True for APC plans authors can still choose and pay. The paid fast-track
 * plans were withdrawn; they stay defined only so existing payments and APC
 * forms that used them still display correctly.
 */
export function isOfferedManuscriptPlan(planId: string | null | undefined): boolean {
  return (MANUSCRIPT_PLAN_IDS as string[]).includes(planId ?? "");
}

/** Author category and route for each manuscript APC plan (shown on the APC form). */
export const MANUSCRIPT_PLAN_DETAILS: Record<
  ManuscriptPaymentPlanId,
  {
    authorCategory: "National" | "International";
    route: "Normal" | "Fast-Track";
    /** Label of the option the author selects before the APC form. */
    optionLabel: string;
  }
> = {
  manuscript_national_normal_inr: {
    authorCategory: "National",
    route: "Normal",
    optionLabel: "National Author (India)",
  },
  manuscript_national_fasttrack_inr: {
    authorCategory: "National",
    route: "Fast-Track",
    optionLabel: "National Author (India) — Fast-Track (withdrawn)",
  },
  manuscript_international_standard_usd: {
    authorCategory: "International",
    route: "Normal",
    optionLabel: "International Author",
  },
  manuscript_international_fasttrack_usd: {
    authorCategory: "International",
    route: "Fast-Track",
    optionLabel: "International Author — Fast-Track (withdrawn)",
  },
};

export type PaymentPurpose =
  | "conference_registration"
  | "tech_research_submission"
  | "manuscript_publication"
  | "gateway_test";

export const LEGACY_PLAN_ALIASES: Record<string, PaymentPlanId> = {
  indian_inr: "national_usd",
  national_inr: "national_usd",
};

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

export function isFeeWaiverPlan(planId: string | null | undefined): boolean {
  return planId === "fee_waiver_usd";
}

export function isManuscriptPlan(
  planId: string | null | undefined,
): planId is ManuscriptPaymentPlanId {
  return (
    typeof planId === "string" &&
    Object.prototype.hasOwnProperty.call(MANUSCRIPT_PAYMENT_PLANS, planId)
  );
}

export function resolvePaymentPurpose(
  planId: PaymentPlanId | string | null | undefined,
): PaymentPurpose {
  if (isGatewayTestPlan(planId)) return "gateway_test";
  if (isTechResearchPlan(planId)) return "tech_research_submission";
  if (isManuscriptPlan(planId)) return "manuscript_publication";
  return "conference_registration";
}

/** Order description shown in the Razorpay / PayPal checkout and receipts. */
export function describePaymentPlan(
  plan: PaymentPlan,
  checkout: PaymentCheckoutBreakdown,
  separator = " — ",
): string {
  if (isGatewayTestPlan(plan.id)) return `Payment gateway test${separator}USD 5`;
  if (isTechResearchPlan(plan.id)) {
    return `${plan.label}${separator}Tech Research submission fee`;
  }
  if (isManuscriptPlan(plan.id)) {
    return checkout.gstRate
      ? `${plan.label}${separator}Manuscript publication fee (${checkout.displaySummary})`
      : `${plan.label}${separator}Manuscript publication fee`;
  }
  if (checkout.gstRate) return `${plan.label}${separator}${checkout.displaySummary}`;
  return `${plan.label}${separator}Conference registration`;
}

export function getPaymentPlan(
  planId: string | null | undefined,
): PaymentPlan | null {
  if (!planId) return null;

  const resolved = (LEGACY_PLAN_ALIASES[planId] ?? planId) as PaymentPlanId;

  if (resolved === "gateway_test_usd") {
    return isPaymentTestPageEnabled() ? GATEWAY_TEST_PAYMENT_PLAN : null;
  }

  if (resolved === "tech_research_usd") {
    return TECH_RESEARCH_PAYMENT_PLAN;
  }

  if (isManuscriptPlan(resolved)) {
    return MANUSCRIPT_PAYMENT_PLANS[resolved];
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

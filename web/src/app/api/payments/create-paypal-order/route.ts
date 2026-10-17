import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { createPaymentIntent } from "@/lib/payments/payment-store";
import {
  ApcBillingFormError,
  linkPaymentToApcBillingForm,
  requireApcBillingFormForPayment,
} from "@/lib/payments/apc-billing-store";
import {
  createPayPalOrder,
  isPayPalConfigured,
  type PayPalReturnPath,
} from "@/lib/payments/paypal";
import {
  describePaymentPlan,
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  isFeeWaiverPlan,
  isManuscriptPlan,
  isOfferedManuscriptPlan,
  resolvePaymentPurpose,
  type PaymentPlanId,
} from "@/lib/payments/plans";
import {
  ConferencePaymentAccessError,
  verifyConferencePaymentAccess,
  verifyFeeWaiverPaymentAccess,
} from "@/lib/payments/fee-waiver-access";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

type Body = {
  planId?: PaymentPlanId;
  registrationId?: string | null;
  billingFormId?: string | null;
  returnPath?: PayPalReturnPath;
};

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Payment service is not configured (Firebase Admin)." },
        { status: 503 }
      );
    }
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." },
        { status: 503 }
      );
    }

    const user = await verifyUserIdToken(request.headers.get("authorization"));
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to continue with payment." },
        { status: 401 }
      );
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const plan = getPaymentPlan(body.planId ?? "international_usd");
    if (!plan) {
      return NextResponse.json({ error: "Invalid PayPal payment plan." }, { status: 400 });
    }

    // PayPal cannot charge INR for this account; INR plans use Razorpay.
    if (plan.currency !== "USD") {
      return NextResponse.json(
        {
          error:
            "PayPal supports USD payments only. Please choose Razorpay for INR (Indian) fee categories.",
        },
        { status: 400 }
      );
    }

    const paymentPurpose = resolvePaymentPurpose(plan.id);
    const checkout = getPaymentCheckoutBreakdown(plan.id);
    if (!checkout) {
      return NextResponse.json({ error: "Invalid PayPal payment plan." }, { status: 400 });
    }

    const returnPath: PayPalReturnPath = isManuscriptPlan(plan.id)
      ? "/for-authors/publication-fees"
      : body.returnPath === "/payments/test"
        ? "/payments/test"
        : body.returnPath === "/tech-research/apply"
          ? "/tech-research/apply"
          : "/conferences/payment";

    // Manuscript APC payments must be based on a submitted APC billing form.
    let billingFormId: string | null = null;
    let manuscriptId: string | null = null;
    if (isManuscriptPlan(plan.id) && !isOfferedManuscriptPlan(plan.id)) {
      return NextResponse.json({ error: "The fast-track publication route has been withdrawn. Please choose the standard APC for your author category." }, { status: 400 });
    }
    if (isManuscriptPlan(plan.id)) {
      try {
        const billingForm = await requireApcBillingFormForPayment({
          billingFormId: body.billingFormId,
          userId: user.uid,
          planId: plan.id,
        });
        billingFormId = billingForm.id;
        manuscriptId = billingForm.details.manuscriptId;
      } catch (error) {
        if (error instanceof ApcBillingFormError) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }
    }

    const registrationId = billingFormId
      ? manuscriptId
      : typeof body.registrationId === "string" && body.registrationId.trim()
        ? body.registrationId.trim().slice(0, 64)
        : null;

    if (isFeeWaiverPlan(plan.id)) {
      await verifyFeeWaiverPaymentAccess({
        userId: user.uid,
        registrationId,
      });
    } else if (plan.id === "national_usd" || plan.id === "international_usd") {
      // Conference fees only for the payer's own conference submission.
      try {
        await verifyConferencePaymentAccess({ userId: user.uid, registrationId });
      } catch (error) {
        if (error instanceof ConferencePaymentAccessError) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }
    }

    const order = await createPayPalOrder({
      planId: plan.id,
      label: plan.label,
      description: describePaymentPlan(plan, checkout, " - "),
      currency: "USD",
      amountMajor: checkout.totalAmountMajor,
      userId: user.uid,
      userEmail: user.email,
      registrationId,
      returnPath,
    });

    const paymentDocId = await createPaymentIntent({
      userId: user.uid,
      userEmail: user.email,
      planId: plan.id,
      purpose: paymentPurpose,
      gateway: "paypal",
      currency: plan.currency,
      amountMinor: checkout.totalAmountMinor,
      amountMajor: checkout.totalAmountMajor,
      displayAmount: checkout.displayTotalAmount,
      paypalOrderId: order.orderId,
      registrationId,
      billingFormId,
      notes: {
        purpose: paymentPurpose,
        planId: plan.id,
        baseAmountUsd: String(checkout.baseAmountMajor),
        gstRate: checkout.gstRate ? String(checkout.gstRate) : "",
        gstAmountUsd: checkout.gstAmountMajor ? String(checkout.gstAmountMajor) : "",
      },
    });

    if (billingFormId) {
      await linkPaymentToApcBillingForm(billingFormId, paymentDocId);
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      approveUrl: order.approveUrl,
      status: order.status,
      displayAmount: checkout.displayTotalAmount,
      planId: plan.id,
      paymentDocId,
    });
  } catch (error) {
    console.error("[payments/create-paypal-order]", error);
    const message = error instanceof Error ? error.message : "Could not create PayPal order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

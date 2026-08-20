import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { createPaymentIntent } from "@/lib/payments/payment-store";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";
import {
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  isFeeWaiverPlan,
  isGatewayTestPlan,
  resolvePaymentPurpose,
  type PaymentPlanId,
} from "@/lib/payments/plans";
import { verifyFeeWaiverPaymentAccess } from "@/lib/payments/fee-waiver-access";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

type Body = {
  planId?: PaymentPlanId;
  registrationId?: string | null;
  returnPath?: "/conferences/payment" | "/payments/test" | "/tech-research/apply";
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

    const paymentPurpose = resolvePaymentPurpose(plan.id);
    const checkout = getPaymentCheckoutBreakdown(plan.id);
    if (!checkout) {
      return NextResponse.json({ error: "Invalid PayPal payment plan." }, { status: 400 });
    }

    const returnPath =
      body.returnPath === "/payments/test"
        ? "/payments/test"
        : body.returnPath === "/tech-research/apply"
          ? "/tech-research/apply"
          : "/conferences/payment";

    const registrationId =
      typeof body.registrationId === "string" && body.registrationId.trim()
        ? body.registrationId.trim().slice(0, 64)
        : null;

    if (isFeeWaiverPlan(plan.id)) {
      await verifyFeeWaiverPaymentAccess({
        userId: user.uid,
        registrationId,
      });
    }

    const order = await createPayPalOrder({
      planId: plan.id,
      label: plan.label,
      description: isGatewayTestPlan(plan.id)
        ? "Payment gateway test - USD 5"
        : paymentPurpose === "tech_research_submission"
          ? `${plan.label} - Tech Research submission fee`
          : checkout.gstRate
            ? `${plan.label} - ${checkout.displaySummary}`
            : `${plan.label} - Conference registration`,
      currency: plan.currency,
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
      notes: {
        purpose: paymentPurpose,
        planId: plan.id,
        baseAmountUsd: String(checkout.baseAmountMajor),
        gstRate: checkout.gstRate ? String(checkout.gstRate) : "",
        gstAmountUsd: checkout.gstAmountMajor ? String(checkout.gstAmountMajor) : "",
      },
    });

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

import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { createPaymentIntent } from "@/lib/payments/payment-store";
import { getPaymentPlan, type PaymentPlanId } from "@/lib/payments/plans";
import {
  formatRazorpayError,
  getRazorpayClient,
  getRazorpayPublicKeyId,
  isRazorpayConfigured,
  paymentReceiptPrefix,
} from "@/lib/payments/razorpay";
import { verifyUserIdToken } from "@/lib/server/verify-user";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

type Body = {
  planId?: PaymentPlanId;
  registrationId?: string | null;
};

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Payment service is not configured (Firebase Admin)." },
        { status: 503 }
      );
    }
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
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

    // Default to international USD 200 as requested.
    const plan = getPaymentPlan(body.planId ?? "international_usd");
    if (!plan) {
      return NextResponse.json({ error: "Invalid payment plan." }, { status: 400 });
    }

    const registrationId =
      typeof body.registrationId === "string" && body.registrationId.trim()
        ? body.registrationId.trim().slice(0, 64)
        : null;

    const receipt = `${paymentReceiptPrefix()}_${Date.now().toString(36)}`.slice(0, 40);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: plan.amountMinor,
      currency: plan.currency,
      receipt,
      notes: {
        purpose: "conference_registration",
        planId: plan.id,
        userId: user.uid,
        userEmail: user.email,
        registrationId: registrationId ?? "",
        journal: siteConfig.shortName,
      },
    });

    const paymentDocId = await createPaymentIntent({
      userId: user.uid,
      userEmail: user.email,
      planId: plan.id,
      currency: plan.currency,
      amountMinor: plan.amountMinor,
      amountMajor: plan.amountMajor,
      displayAmount: plan.displayAmount,
      razorpayOrderId: order.id,
      registrationId,
      notes: {
        purpose: "conference_registration",
        planId: plan.id,
      },
    });

    return NextResponse.json({
      ok: true,
      keyId: getRazorpayPublicKeyId(),
      orderId: order.id,
      amount: plan.amountMinor,
      currency: plan.currency,
      displayAmount: plan.displayAmount,
      planId: plan.id,
      paymentDocId,
      prefill: {
        email: user.email,
      },
      name: siteConfig.name,
      description: `${plan.label} — Conference registration`,
    });
  } catch (error) {
    console.error("[payments/create-order]", error);
    const message = formatRazorpayError(error);
    const status = /currency is not supported/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

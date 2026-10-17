import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { validateApcBillingDetails } from "@/lib/payments/apc-billing";
import { createApcBillingForm } from "@/lib/payments/apc-billing-store";
import {
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  isManuscriptPlan,
  isOfferedManuscriptPlan,
} from "@/lib/payments/plans";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

type Body = {
  planId?: string;
  details?: unknown;
};

/** Saves the APC Payment and Billing Details Form; payment can start only after this. */
export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Payment service is not configured (Firebase Admin)." },
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

    if (!isManuscriptPlan(body.planId)) {
      return NextResponse.json(
        { error: "Please select your author category before completing the APC form." },
        { status: 400 }
      );
    }
    if (!isOfferedManuscriptPlan(body.planId)) {
      return NextResponse.json({ error: "The fast-track publication route has been withdrawn. Please choose the standard APC for your author category." }, { status: 400 });
    }

    // Pricing always comes from the server-side plan configuration.
    const plan = getPaymentPlan(body.planId);
    const checkout = plan ? getPaymentCheckoutBreakdown(plan.id) : null;
    if (!plan || !checkout || checkout.totalAmountMinor <= 0) {
      return NextResponse.json(
        {
          error:
            "No approved APC is configured for the selected publication route, so payment cannot proceed. Please contact the Editorial Office.",
        },
        { status: 400 }
      );
    }

    const validation = validateApcBillingDetails(body.details);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const billingFormId = await createApcBillingForm({
      userId: user.uid,
      userEmail: user.email,
      planId: body.planId,
      details: validation.details,
      checkout,
    });

    return NextResponse.json({
      ok: true,
      billingFormId,
      planId: plan.id,
      currency: checkout.currency,
      totalAmountMinor: checkout.totalAmountMinor,
      displayTotalAmount: checkout.displayTotalAmount,
    });
  } catch (error) {
    console.error("[payments/apc-billing]", error);
    const message =
      error instanceof Error ? error.message : "Could not save the APC form.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

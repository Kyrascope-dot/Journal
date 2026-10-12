import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  getApcOfficeRecipient,
  notifyApcPaymentCompleted,
} from "@/lib/payments/apc-payment-notification";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

type Body = { paymentId?: string };

/** Sends the billing-details email for a paid APC to the Editorial Office again. */
export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({ error: "Payment service is not configured." }, { status: 503 });
    }
    const admin = await verifyAdminIdToken(request.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";
    // Firestore document ids cannot contain "/".
    if (!paymentId || paymentId.includes("/") || paymentId.length > 128) {
      return NextResponse.json({ error: "Missing payment." }, { status: 400 });
    }

    const result = await notifyApcPaymentCompleted(paymentId, { force: true });
    if (!result.sent) {
      return NextResponse.json(
        { error: result.error ?? "Could not send the email." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, recipient: getApcOfficeRecipient() });
  } catch (error) {
    console.error("[admin/apc-payments/resend-email]", error);
    const message = error instanceof Error ? error.message : "Could not send the email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

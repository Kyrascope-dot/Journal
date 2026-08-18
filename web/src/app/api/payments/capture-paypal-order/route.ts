import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  getPaymentByPaypalOrderId,
  markPaypalPaymentPaid,
} from "@/lib/payments/payment-store";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

type Body = {
  orderId?: string;
};

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 503 }
      );
    }
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
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

    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "Missing PayPal order ID." }, { status: 400 });
    }

    const payment = await getPaymentByPaypalOrderId(orderId);
    if (!payment) {
      return NextResponse.json(
        {
          error:
            "PayPal order was not found. Contact the editorial office with your payment reference.",
        },
        { status: 404 }
      );
    }
    if (payment.userId !== user.uid) {
      return NextResponse.json(
        { error: "This payment does not belong to your signed-in account." },
        { status: 403 }
      );
    }
    if (payment.status === "paid" && payment.paypalCaptureId) {
      return NextResponse.json({
        ok: true,
        paymentId: payment.id,
        alreadyPaid: true,
        paypalOrderId: orderId,
        paypalCaptureId: payment.paypalCaptureId,
      });
    }

    const capture = await capturePayPalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal payment was not completed. Status: ${capture.status}` },
        { status: 400 }
      );
    }

    const result = await markPaypalPaymentPaid({
      paypalOrderId: orderId,
      paypalCaptureId: capture.captureId,
      source: "checkout",
    });

    if (!result) {
      return NextResponse.json(
        { error: "Could not update payment status. Contact the editorial office." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      paymentId: result.paymentId,
      alreadyPaid: result.alreadyPaid,
      paypalOrderId: orderId,
      paypalCaptureId: capture.captureId,
    });
  } catch (error) {
    console.error("[payments/capture-paypal-order]", error);
    const message = error instanceof Error ? error.message : "Could not capture PayPal payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

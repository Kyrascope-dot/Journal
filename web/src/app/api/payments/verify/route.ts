import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { markPaymentPaid, getPaymentByRazorpayOrderId } from "@/lib/payments/payment-store";
import {
  isRazorpayConfigured,
  verifyCheckoutSignature,
} from "@/lib/payments/razorpay";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

type Body = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 503 }
      );
    }
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
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

    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment verification fields." },
        { status: 400 }
      );
    }

    const valid = verifyCheckoutSignature({
      orderId,
      paymentId,
      signature,
    });
    if (!valid) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const payment = await getPaymentByRazorpayOrderId(orderId);
    if (!payment) {
      return NextResponse.json(
        {
          error:
            "Payment order was not found. Contact the editorial office with your payment ID.",
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

    const result = await markPaymentPaid({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
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
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
    });
  } catch (error) {
    console.error("[payments/verify]", error);
    const message =
      error instanceof Error ? error.message : "Could not verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

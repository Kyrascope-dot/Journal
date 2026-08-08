import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { markPaymentPaid } from "@/lib/payments/payment-store";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        status?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({ error: "Not configured." }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const event = payload.event ?? "";
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id ?? payload.payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id;

    if (
      (event === "payment.captured" || event === "order.paid") &&
      orderId &&
      paymentId
    ) {
      await markPaymentPaid({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        source: "webhook",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[payments/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

import crypto from "node:crypto";
import Razorpay from "razorpay";
import { siteConfig } from "@/lib/site-config";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) throw new Error("RAZORPAY_KEY_ID is not configured.");
  return keyId;
}

export function getRazorpayPublicKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    ""
  );
}

export function getRazorpayClient(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET!.trim(),
  });
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;
  const body = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqualHex(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function paymentReceiptPrefix(): string {
  return siteConfig.shortName.toLowerCase();
}

/** Normalize Razorpay SDK / API errors into a clear client message. */
export function formatRazorpayError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : "Payment provider error.";
  }

  const err = error as {
    statusCode?: number;
    error?: { description?: string; code?: string; reason?: string };
    message?: string;
  };

  const description =
    err.error?.description || err.error?.reason || err.message || "";

  if (/currency is not supported/i.test(description)) {
    return [
      "USD is not enabled on this Razorpay account yet (Currency is not supported).",
      "In Razorpay Dashboard go to Account & Settings → International payments and activate International Cards / multi-currency.",
      "Until Razorpay approves USD, use the National Participants (USD 150) option, or ask Razorpay support to enable international currency.",
    ].join(" ");
  }

  return description || "Payment provider error.";
}

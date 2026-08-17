"use client";

import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import type { CreateOrderResponse, VerifyPaymentResponse } from "@/lib/client/payments";
import { requestVerifyPayment } from "@/lib/client/payments";

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      if (window.Razorpay) resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type RazorpayCheckoutPrefill = {
  email: string;
  name?: string;
  contact: string;
};

export type OpenRazorpayCheckoutInput = {
  order: CreateOrderResponse;
  prefill: RazorpayCheckoutPrefill;
  notes?: Record<string, string>;
  onSuccess: (result: VerifyPaymentResponse & { razorpay_payment_id: string }) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure: (message: string) => void;
};

/** Shared Razorpay modal — same international USD settings for conference and test checkout. */
export async function openRazorpayCheckout(input: OpenRazorpayCheckoutInput): Promise<void> {
  const ready = await loadRazorpayScript();
  if (!ready || !window.Razorpay) {
    throw new Error("Could not load Razorpay Checkout. Please try again.");
  }

  const rzp = new window.Razorpay({
    key: input.order.keyId,
    amount: input.order.amount,
    currency: input.order.currency,
    name: input.order.name,
    description: input.order.description,
    order_id: input.order.orderId,
    prefill: {
      email: input.prefill.email,
      name: input.prefill.name || "",
      contact: input.prefill.contact,
    },
    notes: input.notes,
    theme: { color: "#0f4c81" },
    handler: (response) => {
      void (async () => {
        try {
          const verified = await requestVerifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await input.onSuccess({
            ...verified,
            razorpay_payment_id: response.razorpay_payment_id,
          });
        } catch (verifyError) {
          input.onFailure(
            verifyError instanceof Error
              ? formatCheckoutPaymentError(verifyError.message)
              : "Payment was taken but verification failed. Contact the editorial office with your Razorpay payment ID."
          );
        }
      })();
    },
    modal: {
      ondismiss: () => {
        input.onDismiss?.();
      },
    },
  });

  rzp.on("payment.failed", (response: unknown) => {
    const details = response as {
      error?: { description?: string; reason?: string; code?: string };
    };
    input.onFailure(
      formatCheckoutPaymentError(
        details.error?.description || details.error?.reason || details.error?.code
      )
    );
  });

  rzp.open();
}

export function validateInternationalCheckoutContact(contact: string): string | null {
  const trimmed = contact.trim();
  if (!trimmed) {
    return "Please enter a valid mobile number. Razorpay requires it for international USD card payments.";
  }
  if (trimmed.length < 8) {
    return "Please enter a complete mobile number with country code (e.g. +1 555 123 4567).";
  }
  return null;
}

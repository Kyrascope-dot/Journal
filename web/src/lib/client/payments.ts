"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import type { PaymentPlanId } from "@/lib/payments/plans";

export type CreateOrderResponse = {
  ok: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: "USD" | "INR";
  displayAmount: string;
  planId: PaymentPlanId;
  paymentDocId: string;
  prefill: { email: string };
  name: string;
  description: string;
  error?: string;
};

export type VerifyPaymentResponse = {
  ok: boolean;
  paymentId?: string;
  alreadyPaid?: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  error?: string;
};

export type CreatePayPalOrderResponse = {
  ok: boolean;
  orderId: string;
  approveUrl: string;
  status: string | null;
  displayAmount: string;
  planId: PaymentPlanId;
  paymentDocId: string;
  error?: string;
};

export type CapturePayPalOrderResponse = {
  ok: boolean;
  paymentId?: string;
  alreadyPaid?: boolean;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  error?: string;
};

async function authFetch(path: string, init?: RequestInit) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Please sign in to continue with payment.");
  const token = await user.getIdToken(/* forceRefresh */ true);
  return fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
}

export async function requestCreatePaymentOrder(input: {
  planId: PaymentPlanId;
  registrationId?: string;
}): Promise<CreateOrderResponse> {
  const response = await authFetch("/api/payments/create-order", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as CreateOrderResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Could not create payment order.");
  }
  return data;
}

export async function requestVerifyPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
  const response = await authFetch("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as VerifyPaymentResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Payment verification failed.");
  }
  return data;
}

export async function requestCreatePayPalOrder(input: {
  planId: PaymentPlanId;
  registrationId?: string;
}): Promise<CreatePayPalOrderResponse> {
  const response = await authFetch("/api/payments/create-paypal-order", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as CreatePayPalOrderResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Could not create PayPal order.");
  }
  return data;
}

export async function requestCapturePayPalOrder(input: {
  orderId: string;
}): Promise<CapturePayPalOrderResponse> {
  const response = await authFetch("/api/payments/capture-paypal-order", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as CapturePayPalOrderResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "PayPal payment capture failed.");
  }
  return data;
}

export type PaymentHistoryItem = {
  id: string;
  planId: PaymentPlanId;
  displayAmount: string;
  currency: string;
  status: string;
  gateway?: "razorpay" | "paypal";
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  registrationId: string | null;
  createdAt: string | null;
  paidAt: string | null;
};

export async function requestMyPayments(): Promise<PaymentHistoryItem[]> {
  const response = await authFetch("/api/payments/mine");
  const data = (await response.json()) as {
    payments?: PaymentHistoryItem[];
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load payments.");
  return data.payments ?? [];
}

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { PaymentPlanId } from "@/lib/payments/plans";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";
export type PaymentGateway = "razorpay" | "paypal";

export type PaymentRecord = {
  id: string;
  userId: string;
  userEmail: string;
  purpose: "conference_registration";
  gateway: PaymentGateway;
  planId: PaymentPlanId;
  currency: "USD" | "INR";
  amountMinor: number;
  amountMajor: number;
  displayAmount: string;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  registrationId: string | null;
  notes: Record<string, string>;
  createdAt: string | null;
  paidAt: string | null;
};

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const dated = value as { toDate(): Date };
    if (typeof dated.toDate === "function") return dated.toDate().toISOString();
  }
  return null;
}

export async function createPaymentIntent(input: {
  userId: string;
  userEmail: string;
  planId: PaymentPlanId;
  gateway?: PaymentGateway;
  currency: "USD" | "INR";
  amountMinor: number;
  amountMajor: number;
  displayAmount: string;
  razorpayOrderId?: string;
  paypalOrderId?: string;
  registrationId?: string | null;
  notes?: Record<string, string>;
}): Promise<string> {
  const db = getAdminFirestore();
  const ref = db.collection("payments").doc();
  await ref.set({
    userId: input.userId,
    userEmail: input.userEmail,
    purpose: "conference_registration",
    gateway: input.gateway ?? "razorpay",
    planId: input.planId,
    currency: input.currency,
    amountMinor: input.amountMinor,
    amountMajor: input.amountMajor,
    displayAmount: input.displayAmount,
    status: "created",
    razorpayOrderId: input.razorpayOrderId ?? "",
    razorpayPaymentId: null,
    razorpaySignature: null,
    paypalOrderId: input.paypalOrderId ?? null,
    paypalCaptureId: null,
    registrationId: input.registrationId ?? null,
    notes: input.notes ?? {},
    createdAt: FieldValue.serverTimestamp(),
    paidAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getPaymentByRazorpayOrderId(
  razorpayOrderId: string
): Promise<PaymentRecord | null> {
  const snap = await getAdminFirestore()
    .collection("payments")
    .where("razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data();
  return {
    id: doc.id,
    userId: String(data.userId ?? ""),
    userEmail: String(data.userEmail ?? ""),
    purpose: "conference_registration" as const,
    gateway: (data.gateway ?? "razorpay") as PaymentGateway,
    planId: data.planId as PaymentPlanId,
    currency: data.currency as "USD" | "INR",
    amountMinor: Number(data.amountMinor ?? 0),
    amountMajor: Number(data.amountMajor ?? 0),
    displayAmount: String(data.displayAmount ?? ""),
    status: data.status as PaymentStatus,
    razorpayOrderId: String(data.razorpayOrderId ?? ""),
    razorpayPaymentId: data.razorpayPaymentId ? String(data.razorpayPaymentId) : null,
    razorpaySignature: data.razorpaySignature ? String(data.razorpaySignature) : null,
    paypalOrderId: data.paypalOrderId ? String(data.paypalOrderId) : null,
    paypalCaptureId: data.paypalCaptureId ? String(data.paypalCaptureId) : null,
    registrationId: data.registrationId ? String(data.registrationId) : null,
    notes: (data.notes ?? {}) as Record<string, string>,
    createdAt: toIso(data.createdAt),
    paidAt: toIso(data.paidAt),
  };
}

export async function markPaymentPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
  source: "checkout" | "webhook";
}): Promise<{ paymentId: string; alreadyPaid: boolean } | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("payments")
    .where("razorpayOrderId", "==", input.razorpayOrderId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data();
  if (data.status === "paid") {
    return { paymentId: doc.id, alreadyPaid: true };
  }

  await doc.ref.update({
    status: "paid",
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature ?? data.razorpaySignature ?? null,
    paidAt: Timestamp.now(),
    updatedAt: FieldValue.serverTimestamp(),
    verifiedVia: input.source,
  });

  return { paymentId: doc.id, alreadyPaid: false };
}

export async function getPaymentByPaypalOrderId(
  paypalOrderId: string
): Promise<PaymentRecord | null> {
  const snap = await getAdminFirestore()
    .collection("payments")
    .where("paypalOrderId", "==", paypalOrderId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data();
  return {
    id: doc.id,
    userId: String(data.userId ?? ""),
    userEmail: String(data.userEmail ?? ""),
    purpose: "conference_registration" as const,
    gateway: (data.gateway ?? "paypal") as PaymentGateway,
    planId: data.planId as PaymentPlanId,
    currency: data.currency as "USD" | "INR",
    amountMinor: Number(data.amountMinor ?? 0),
    amountMajor: Number(data.amountMajor ?? 0),
    displayAmount: String(data.displayAmount ?? ""),
    status: data.status as PaymentStatus,
    razorpayOrderId: String(data.razorpayOrderId ?? ""),
    razorpayPaymentId: data.razorpayPaymentId ? String(data.razorpayPaymentId) : null,
    razorpaySignature: data.razorpaySignature ? String(data.razorpaySignature) : null,
    paypalOrderId: data.paypalOrderId ? String(data.paypalOrderId) : null,
    paypalCaptureId: data.paypalCaptureId ? String(data.paypalCaptureId) : null,
    registrationId: data.registrationId ? String(data.registrationId) : null,
    notes: (data.notes ?? {}) as Record<string, string>,
    createdAt: toIso(data.createdAt),
    paidAt: toIso(data.paidAt),
  };
}

export async function markPaypalPaymentPaid(input: {
  paypalOrderId: string;
  paypalCaptureId: string;
  source: "checkout" | "webhook";
}): Promise<{ paymentId: string; alreadyPaid: boolean } | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("payments")
    .where("paypalOrderId", "==", input.paypalOrderId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data();
  if (data.status === "paid") {
    return { paymentId: doc.id, alreadyPaid: true };
  }

  await doc.ref.update({
    status: "paid",
    paypalCaptureId: input.paypalCaptureId,
    paidAt: Timestamp.now(),
    updatedAt: FieldValue.serverTimestamp(),
    verifiedVia: input.source,
  });

  return { paymentId: doc.id, alreadyPaid: false };
}

export async function listPaymentsForUser(userId: string): Promise<PaymentRecord[]> {
  const snap = await getAdminFirestore()
    .collection("payments")
    .where("userId", "==", userId)
    .limit(50)
    .get();

  return snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: String(data.userId ?? ""),
        userEmail: String(data.userEmail ?? ""),
        purpose: "conference_registration" as const,
        gateway: (data.gateway ?? "razorpay") as PaymentGateway,
        planId: data.planId as PaymentPlanId,
        currency: data.currency as "USD" | "INR",
        amountMinor: Number(data.amountMinor ?? 0),
        amountMajor: Number(data.amountMajor ?? 0),
        displayAmount: String(data.displayAmount ?? ""),
        status: data.status as PaymentStatus,
        razorpayOrderId: String(data.razorpayOrderId ?? ""),
        razorpayPaymentId: data.razorpayPaymentId ? String(data.razorpayPaymentId) : null,
        razorpaySignature: data.razorpaySignature ? String(data.razorpaySignature) : null,
        paypalOrderId: data.paypalOrderId ? String(data.paypalOrderId) : null,
        paypalCaptureId: data.paypalCaptureId ? String(data.paypalCaptureId) : null,
        registrationId: data.registrationId ? String(data.registrationId) : null,
        notes: (data.notes ?? {}) as Record<string, string>,
        createdAt: toIso(data.createdAt),
        paidAt: toIso(data.paidAt),
      };
    })
    .sort((a, b) => {
      const am = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bm = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bm - am;
    });
}

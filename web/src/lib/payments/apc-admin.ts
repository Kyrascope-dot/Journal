import { getAdminFirestore } from "@/lib/firebase-admin";
import type { ApcBillingDetails } from "@/lib/payments/apc-billing";
import {
  MANUSCRIPT_PLAN_DETAILS,
  getPaymentCheckoutBreakdown,
  isManuscriptPlan,
} from "@/lib/payments/plans";
import type {
  AdminApcPayment,
  AdminApcPaymentStatus,
  AdminApcRecord,
} from "@/types/apc-payments";

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value) {
    const dated = value as { toDate(): Date };
    if (typeof dated.toDate === "function") return dated.toDate().toISOString();
  }
  return null;
}

function mapPayment(id: string, data: FirebaseFirestore.DocumentData): AdminApcPayment {
  const gateway = data.gateway === "paypal" ? "paypal" : "razorpay";
  const reference =
    gateway === "paypal"
      ? String(data.paypalCaptureId ?? data.paypalOrderId ?? "")
      : String(data.razorpayPaymentId ?? data.razorpayOrderId ?? "");
  const status = (["paid", "created", "failed", "refunded"] as const).includes(data.status)
    ? (data.status as AdminApcPaymentStatus)
    : "created";
  const emailStatus = data.apcOfficeEmailStatus;
  return {
    id,
    status,
    gateway,
    reference,
    displayAmount: String(data.displayAmount ?? ""),
    currency: String(data.currency ?? ""),
    createdAt: toIso(data.createdAt),
    paidAt: toIso(data.paidAt),
    officeEmailStatus:
      emailStatus === "sent" || emailStatus === "failed" || emailStatus === "sending"
        ? emailStatus
        : "not_sent",
    officeEmailError: data.apcOfficeEmailError ? String(data.apcOfficeEmailError) : null,
  };
}

/** A completed payment wins; otherwise the most recent attempt. */
function pickPayment(payments: AdminApcPayment[]): AdminApcPayment | null {
  if (payments.length === 0) return null;
  const byNewest = [...payments].sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
  );
  return byNewest.find((payment) => payment.status === "paid") ?? byNewest[0];
}

function planInfo(planId: string) {
  if (!isManuscriptPlan(planId)) {
    return { authorCategory: "—", route: "—", displayTotalAmount: "—" };
  }
  const plan = MANUSCRIPT_PLAN_DETAILS[planId];
  return {
    authorCategory: plan.authorCategory,
    route: plan.route,
    displayTotalAmount: getPaymentCheckoutBreakdown(planId)?.displayTotalAmount ?? "—",
  };
}

/** Every APC form with its payment, newest first (admin dashboard). */
export async function listApcRecordsForAdmin(): Promise<AdminApcRecord[]> {
  const db = getAdminFirestore();
  const [formsSnap, paymentsSnap] = await Promise.all([
    db.collection("apcBillingForms").get(),
    db.collection("payments").where("purpose", "==", "manuscript_publication").get(),
  ]);

  const paymentsByForm = new Map<string, AdminApcPayment[]>();
  const paymentsWithoutForm: { payment: AdminApcPayment; data: FirebaseFirestore.DocumentData }[] =
    [];
  for (const doc of paymentsSnap.docs) {
    const data = doc.data();
    const payment = mapPayment(doc.id, data);
    const formId = data.billingFormId ? String(data.billingFormId) : "";
    if (formId) {
      paymentsByForm.set(formId, [...(paymentsByForm.get(formId) ?? []), payment]);
    } else {
      paymentsWithoutForm.push({ payment, data });
    }
  }

  const records: AdminApcRecord[] = formsSnap.docs.map((doc) => {
    const data = doc.data();
    const planId = String(data.planId ?? "");
    return {
      id: doc.id,
      formId: doc.id,
      submittedAt: toIso(data.createdAt),
      planId,
      ...planInfo(planId),
      accountEmail: String(data.userEmail ?? ""),
      details: (data.details ?? null) as ApcBillingDetails | null,
      payment: pickPayment(paymentsByForm.get(doc.id) ?? []),
    };
  });

  // Payments started before the APC form existed have no form to show.
  for (const { payment, data } of paymentsWithoutForm) {
    const planId = String(data.planId ?? "");
    records.push({
      id: `payment:${payment.id}`,
      formId: null,
      submittedAt: payment.createdAt,
      planId,
      ...planInfo(planId),
      accountEmail: String(data.userEmail ?? ""),
      details: null,
      payment,
    });
  }

  return records.sort((a, b) =>
    String(b.submittedAt ?? "").localeCompare(String(a.submittedAt ?? "")),
  );
}

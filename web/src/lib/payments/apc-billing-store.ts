import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { APC_FORM_TITLE, type ApcBillingDetails } from "@/lib/payments/apc-billing";
import type {
  ManuscriptPaymentPlanId,
  PaymentCheckoutBreakdown,
} from "@/lib/payments/plans";

/** Firestore collection for submitted APC billing forms (Admin SDK only). */
const COLLECTION = "apcBillingForms";

export type ApcBillingFormRecord = {
  id: string;
  userId: string;
  userEmail: string;
  planId: ManuscriptPaymentPlanId;
  details: ApcBillingDetails;
};

/** Raised when a payment is attempted without a usable APC billing form. */
export class ApcBillingFormError extends Error {}

export async function createApcBillingForm(input: {
  userId: string;
  userEmail: string;
  planId: ManuscriptPaymentPlanId;
  details: ApcBillingDetails;
  /** Server-computed pricing at the time the form was submitted. */
  checkout: PaymentCheckoutBreakdown;
}): Promise<string> {
  const ref = getAdminFirestore().collection(COLLECTION).doc();
  await ref.set({
    userId: input.userId,
    userEmail: input.userEmail,
    planId: input.planId,
    details: input.details,
    pricing: {
      currency: input.checkout.currency,
      baseAmountMinor: input.checkout.baseAmountMinor,
      gstRate: input.checkout.gstRate,
      gstAmountMinor: input.checkout.gstAmountMinor,
      discountAmountMinor: 0,
      totalAmountMinor: input.checkout.totalAmountMinor,
      displaySummary: input.checkout.displaySummary,
    },
    paymentDocIds: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getApcBillingForm(id: string): Promise<ApcBillingFormRecord | null> {
  const snap = await getAdminFirestore().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    id: snap.id,
    userId: String(data.userId ?? ""),
    userEmail: String(data.userEmail ?? ""),
    planId: data.planId as ManuscriptPaymentPlanId,
    details: data.details as ApcBillingDetails,
  };
}

/**
 * The submitted form a manuscript payment must be based on: it has to exist,
 * belong to the signed-in user, and be for the same publication route.
 */
export async function requireApcBillingFormForPayment(input: {
  billingFormId: unknown;
  userId: string;
  planId: string;
}): Promise<ApcBillingFormRecord> {
  const id = typeof input.billingFormId === "string" ? input.billingFormId.trim() : "";
  // Firestore document ids cannot contain "/".
  if (!id || id.includes("/") || id.length > 128) {
    throw new ApcBillingFormError(
      `Please complete the ${APC_FORM_TITLE} before proceeding with payment.`,
    );
  }
  const form = await getApcBillingForm(id);
  if (!form || form.userId !== input.userId) {
    throw new ApcBillingFormError(
      `Your ${APC_FORM_TITLE} could not be found. Please complete the form again.`,
    );
  }
  if (form.planId !== input.planId) {
    throw new ApcBillingFormError(
      "The publication route does not match your submitted APC form. Please complete the form again for the selected route.",
    );
  }
  return form;
}

/** Records which payment attempt(s) were started from a billing form. */
export async function linkPaymentToApcBillingForm(
  billingFormId: string,
  paymentDocId: string,
): Promise<void> {
  await getAdminFirestore()
    .collection(COLLECTION)
    .doc(billingFormId)
    .update({
      paymentDocIds: FieldValue.arrayUnion(paymentDocId),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

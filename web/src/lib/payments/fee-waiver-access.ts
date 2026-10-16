import { getAdminFirestore } from "@/lib/firebase-admin";

export const FEE_WAIVER_PAYMENT_ERROR =
  "The USD 100 fee-waiver payment is available only for conference submissions with an approved fee waiver.";

export async function verifyFeeWaiverPaymentAccess(input: {
  userId: string;
  registrationId: string | null;
}): Promise<void> {
  const registrationId = input.registrationId?.trim();
  if (!registrationId) {
    throw new Error("Registration ID is required for fee-waiver payment.");
  }

  const snap = await getAdminFirestore()
    .collection("submissions")
    .where("registrationId", "==", registrationId)
    .where("authorId", "==", input.userId)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new Error(FEE_WAIVER_PAYMENT_ERROR);
  }

  const data = snap.docs[0]!.data();
  const waiver = String(data.conferenceFeeWaiver ?? "none");
  if (
    data.submissionPurpose !== "conference" ||
    (waiver !== "partial" && waiver !== "full")
  ) {
    throw new Error(FEE_WAIVER_PAYMENT_ERROR);
  }
}

/** Raised when a conference payment is not linked to the payer's own conference submission. */
export class ConferencePaymentAccessError extends Error {}

export const CONFERENCE_PAYMENT_ACCESS_ERROR =
  "Conference payment requires the Registration ID of your own conference submission (it starts with GCRC-). If you are paying the publication fee (APC) for an accepted journal manuscript, please use the Publication fees page instead.";

/**
 * Conference registration fees can only be paid for the payer's own
 * conference submission. This stops journal APC payments being made through
 * the conference page, which has no APC billing form.
 */
export async function verifyConferencePaymentAccess(input: {
  userId: string;
  registrationId: string | null;
}): Promise<void> {
  const registrationId = input.registrationId?.trim();
  if (!registrationId) {
    throw new ConferencePaymentAccessError(CONFERENCE_PAYMENT_ACCESS_ERROR);
  }

  const snap = await getAdminFirestore()
    .collection("submissions")
    .where("registrationId", "==", registrationId)
    .where("authorId", "==", input.userId)
    .limit(1)
    .get();

  if (snap.empty || snap.docs[0]!.data().submissionPurpose !== "conference") {
    throw new ConferencePaymentAccessError(CONFERENCE_PAYMENT_ACCESS_ERROR);
  }
}

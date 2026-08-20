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

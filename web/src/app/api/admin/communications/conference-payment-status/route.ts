import { NextResponse } from "next/server";
import {
  isPaymentLinkSentForSubmission,
  isPaymentReminderSentForSubmission,
  loadConferencePaymentCommunicationIndex,
} from "@/lib/conference-payment-communications";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const db = getAdminFirestore();
  const [index, submissionsSnap] = await Promise.all([
    loadConferencePaymentCommunicationIndex(db),
    db
      .collection("submissions")
      .where("submissionPurpose", "==", "conference")
      .where("status", "==", "accepted")
      .get(),
  ]);

  const paymentLinkPendingIds: string[] = [];
  const paymentLinkSentIds: string[] = [];
  const paymentReminderPendingIds: string[] = [];
  const paymentReminderSentIds: string[] = [];

  for (const doc of submissionsSnap.docs) {
    const data = doc.data();
    const submission = {
      id: doc.id,
      registrationId: String(data.registrationId ?? doc.id),
      submissionPurpose: "conference" as const,
      status: "accepted" as const,
      paymentLinkSent: Boolean(data.paymentLinkSent ?? false),
      paymentReminderSent: Boolean(data.paymentReminderSent ?? false),
    };

    const linkSent = isPaymentLinkSentForSubmission(submission, index);
    const reminderSent = isPaymentReminderSentForSubmission(submission, index);

    if (linkSent) paymentLinkSentIds.push(doc.id);
    else paymentLinkPendingIds.push(doc.id);

    if (reminderSent) paymentReminderSentIds.push(doc.id);
    else paymentReminderPendingIds.push(doc.id);
  }

  return NextResponse.json({
    totalAccepted: submissionsSnap.size,
    paymentLinkPendingIds,
    paymentLinkSentIds,
    paymentReminderPendingIds,
    paymentReminderSentIds,
  });
}

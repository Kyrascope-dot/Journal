import {
  isBeforePaymentDeadline,
  PAYMENT_DEADLINE_IST_LABEL,
} from "@/lib/conference-deadline";
import {
  getLatestZoomLinksSentAt,
  getLatestPaymentReminderSentAt,
  loadConferencePaymentCommunicationIndex,
  PAYMENT_REMINDER_TEMPLATE_SEED,
  ZOOM_LINKS_TEMPLATE_SEED,
  timestampToIst,
} from "@/lib/conference-payment-communications";
import {
  loadTemplateBySeed,
  markConferenceCommunicationSent,
  personalizeTemplate,
  sendPersonalizedAndLog,
} from "@/lib/email/conference-managed-email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { SubmissionActionEmailStatus } from "@/types/communications";

export type { SubmissionActionEmailStatus };

function submissionFromSnap(
  id: string,
  data: FirebaseFirestore.DocumentData
): {
  id: string;
  registrationId: string;
  authorName: string;
  authorEmail: string;
  submissionPurpose: string;
  status: string;
  conferenceFeeWaiver: string;
  paymentCompleted: boolean;
  paymentReminderSent: boolean;
  paymentReminderSentAt: unknown;
  zoomLinkSent: boolean;
  zoomLinkSentAt: unknown;
} {
  return {
    id,
    registrationId: String(data.registrationId ?? id),
    authorName: String(data.authorName ?? ""),
    authorEmail: String(data.authorEmail ?? "").trim(),
    submissionPurpose: String(data.submissionPurpose ?? "journal"),
    status: String(data.status ?? "pending"),
    conferenceFeeWaiver: String(data.conferenceFeeWaiver ?? "none"),
    paymentCompleted: Boolean(data.paymentCompleted ?? false),
    paymentReminderSent: Boolean(data.paymentReminderSent ?? false),
    paymentReminderSentAt: data.paymentReminderSentAt ?? null,
    zoomLinkSent: Boolean(data.zoomLinkSent ?? false),
    zoomLinkSentAt: data.zoomLinkSentAt ?? null,
  };
}

export async function getSubmissionActionEmailStatus(
  submissionId: string
): Promise<SubmissionActionEmailStatus> {
  const db = getAdminFirestore();
  const snap = await db.doc(`submissions/${submissionId}`).get();
  if (!snap.exists) {
    throw new Error("Submission not found.");
  }
  const sub = submissionFromSnap(snap.id, snap.data()!);
  const index = await loadConferencePaymentCommunicationIndex(db);

  const reminderFromLog = getLatestPaymentReminderSentAt(sub.id, sub.registrationId, index);
  const zoomFromLog = getLatestZoomLinksSentAt(sub.id, sub.registrationId, index);

  return {
    beforePaymentDeadline: isBeforePaymentDeadline(),
    paymentDeadlineLabel: PAYMENT_DEADLINE_IST_LABEL,
    paymentReminder: {
      sent: sub.paymentReminderSent || reminderFromLog.sent,
      sentAt:
        reminderFromLog.sentAt ??
        timestampToIst(sub.paymentReminderSentAt as FirebaseFirestore.Timestamp | Date | null),
    },
    zoomLinks: {
      sent: sub.zoomLinkSent || zoomFromLog.sent,
      sentAt:
        zoomFromLog.sentAt ??
        timestampToIst(sub.zoomLinkSentAt as FirebaseFirestore.Timestamp | Date | null),
    },
  };
}

export async function sendConferencePaymentReminderEmail(
  admin: { uid: string; email: string },
  submissionId: string
): Promise<{ sent: true; messageId: string | null; recipient: string }> {
  const db = getAdminFirestore();
  const snap = await db.doc(`submissions/${submissionId}`).get();
  if (!snap.exists) throw new Error("Submission not found.");

  const sub = submissionFromSnap(snap.id, snap.data()!);
  if (sub.submissionPurpose !== "conference") {
    throw new Error("Payment reminders apply to conference submissions only.");
  }
  if (sub.paymentCompleted) {
    throw new Error("Payment is already completed for this submission.");
  }
  if (sub.conferenceFeeWaiver === "full") {
    throw new Error("Payment reminders do not apply to full fee waiver submissions.");
  }
  if (!isBeforePaymentDeadline()) {
    throw new Error("The payment deadline has passed. Payment reminders can no longer be sent.");
  }
  if (!sub.authorEmail) {
    throw new Error("Submission has no author email on record.");
  }

  const template = await loadTemplateBySeed(PAYMENT_REMINDER_TEMPLATE_SEED);
  const ctx = { authorName: sub.authorName, author_name: sub.authorName };
  const subject = personalizeTemplate(template.subject, ctx);
  const html = personalizeTemplate(template.bodyHtml, ctx);
  const text = personalizeTemplate(template.bodyText, ctx);

  const result = await sendPersonalizedAndLog({
    admin,
    submissionId: sub.id,
    registrationId: sub.registrationId,
    recipient: sub.authorEmail,
    subject,
    html,
    text,
    templateId: PAYMENT_REMINDER_TEMPLATE_SEED,
    actionType: "PAYMENT_REMINDER",
  });

  await markConferenceCommunicationSent(sub.id, PAYMENT_REMINDER_TEMPLATE_SEED);

  return { sent: true, messageId: result.messageId, recipient: sub.authorEmail };
}

export async function sendConferenceZoomLinksEmail(
  admin: { uid: string; email: string },
  submissionId: string
): Promise<{ sent: true; messageId: string | null; recipient: string }> {
  const db = getAdminFirestore();
  const snap = await db.doc(`submissions/${submissionId}`).get();
  if (!snap.exists) throw new Error("Submission not found.");

  const sub = submissionFromSnap(snap.id, snap.data()!);
  if (sub.submissionPurpose !== "conference") {
    throw new Error("Zoom links apply to conference submissions only.");
  }
  if (
    !sub.paymentCompleted &&
    sub.conferenceFeeWaiver !== "full"
  ) {
    throw new Error("Payment must be completed before Zoom links can be sent.");
  }
  if (!sub.authorEmail) {
    throw new Error("Submission has no author email on record.");
  }

  const template = await loadTemplateBySeed(ZOOM_LINKS_TEMPLATE_SEED);
  const ctx = { authorName: sub.authorName, author_name: sub.authorName };
  const subject = personalizeTemplate(template.subject, ctx);
  const html = personalizeTemplate(template.bodyHtml, ctx);
  const text = personalizeTemplate(template.bodyText, ctx);

  const result = await sendPersonalizedAndLog({
    admin,
    submissionId: sub.id,
    registrationId: sub.registrationId,
    recipient: sub.authorEmail,
    subject,
    html,
    text,
    templateId: ZOOM_LINKS_TEMPLATE_SEED,
    actionType: "ZOOM_LINKS",
  });

  await markConferenceCommunicationSent(sub.id, ZOOM_LINKS_TEMPLATE_SEED);

  return { sent: true, messageId: result.messageId, recipient: sub.authorEmail };
}

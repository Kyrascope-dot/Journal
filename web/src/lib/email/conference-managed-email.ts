import { FieldValue } from "firebase-admin/firestore";
import { htmlToPlainText } from "@/lib/email/bulk-templates";
import { personalizeTemplate } from "@/lib/email/bulk-email-service";
import { emailService } from "@/lib/email/email-service";
import {
  PAYMENT_LINK_TEMPLATE_SEED,
  PAYMENT_REMINDER_TEMPLATE_SEED,
  ZOOM_LINKS_TEMPLATE_SEED,
} from "@/lib/conference-payment-communications";
import { getAdminFirestore } from "@/lib/firebase-admin";

export { personalizeTemplate };

export type ManagedEmailActionType = "PAYMENT_REMINDER" | "ZOOM_LINKS";

export async function loadTemplateBySeed(seedKey: string): Promise<{
  subject: string;
  bodyHtml: string;
  bodyText: string;
}> {
  const snap = await getAdminFirestore().doc(`emailTemplates/${seedKey}`).get();
  if (!snap.exists) {
    throw new Error(`Email template "${seedKey}" is not configured. Open Communications → Templates to seed defaults.`);
  }
  const data = snap.data()!;
  const bodyHtml = String(data.bodyHtml ?? "");
  if (!bodyHtml.trim()) throw new Error(`Email template "${seedKey}" has no body.`);
  return {
    subject: String(data.subject ?? ""),
    bodyHtml,
    bodyText: String(data.bodyText ?? "").trim() || htmlToPlainText(bodyHtml),
  };
}

async function writeEmailLog(entry: {
  type: string;
  channel: "individual";
  actionType: ManagedEmailActionType;
  submissionId: string;
  registrationId: string;
  recipient: string;
  subject: string;
  template: string;
  deliveryStatus: string;
  providerMessageId?: string | null;
  error?: string | null;
}): Promise<void> {
  await getAdminFirestore().collection("email_logs").add({
    ...entry,
    campaignId: null,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function sendPersonalizedAndLog(input: {
  admin: { uid: string; email: string };
  submissionId: string;
  registrationId: string;
  recipient: string;
  subject: string;
  html: string;
  text: string;
  templateId: string;
  actionType: ManagedEmailActionType;
}): Promise<{ messageId: string | null }> {
  const result = await emailService.send({
    to: input.recipient,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  await writeEmailLog({
    type: "individual",
    channel: "individual",
    actionType: input.actionType,
    submissionId: input.submissionId,
    registrationId: input.registrationId,
    recipient: input.recipient,
    subject: input.subject,
    template: input.templateId,
    deliveryStatus: "sent",
    providerMessageId: result.messageId,
  });

  const db = getAdminFirestore();
  await db.doc(`submissions/${input.submissionId}`).set(
    {
      lastEmailSent: FieldValue.serverTimestamp(),
      lastEmailTemplate: input.templateId,
      emailStatus: "sent",
      emailTimestamp: FieldValue.serverTimestamp(),
      deliveryStatus: "sent",
      lastUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection("emailCampaigns").add({
    name: `${input.actionType} — ${input.registrationId}`,
    purpose: "conference",
    filters: { purpose: "conference" },
    subject: input.subject,
    bodyHtml: input.html,
    bodyText: input.text,
    templateId: input.templateId,
    status: "completed",
    totalRecipients: 1,
    sentCount: 1,
    failedCount: 0,
    pendingCount: 0,
    batchSize: 1,
    queueThreshold: 50,
    scheduledFor: null,
    createdById: input.admin.uid,
    createdByEmail: input.admin.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastProcessedAt: FieldValue.serverTimestamp(),
    error: null,
    channel: "individual",
    submissionId: input.submissionId,
    actionType: input.actionType,
  });

  return { messageId: result.messageId };
}

export async function markConferenceCommunicationSent(
  submissionId: string,
  seedKey: string
): Promise<void> {
  const now = FieldValue.serverTimestamp();
  const update: Record<string, unknown> = { lastUpdatedAt: now };

  if (seedKey === PAYMENT_LINK_TEMPLATE_SEED) {
    update.paymentLinkSent = true;
    update.paymentLinkSentAt = now;
  }
  if (seedKey === PAYMENT_REMINDER_TEMPLATE_SEED) {
    update.paymentReminderSent = true;
    update.paymentReminderSentAt = now;
  }
  if (seedKey === ZOOM_LINKS_TEMPLATE_SEED) {
    update.zoomLinkSent = true;
    update.zoomLinkSentAt = now;
  }

  if (Object.keys(update).length > 1) {
    await getAdminFirestore().doc(`submissions/${submissionId}`).set(update, { merge: true });
  }
}

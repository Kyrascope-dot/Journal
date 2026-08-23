import type { Firestore } from "firebase-admin/firestore";
import type { Submission } from "@/types/dashboard";

export const PAYMENT_LINK_TEMPLATE_SEED = "conference_q3_2026_payment_link";
export const PAYMENT_LINK_TEMPLATE_NAME = "Payment Link - GCR Conference July–September 2026";
export const PAYMENT_LINK_SUBJECT = "Payment Link - GCR International Conference Q3 2026";

export const PAYMENT_REMINDER_TEMPLATE_SEED = "conference_payment_reminder";
export const PAYMENT_REMINDER_TEMPLATE_NAME = "GCR Conference — Payment Reminder";
export const PAYMENT_REMINDER_SUBJECT =
  "Payment Reminder — GCR International Conference Q3 2026";

const LEGACY_PAYMENT_LINK_SUBJECT_PARTS = [
  "Payment Link",
  "GCR International Conference Q3",
  "September 2026",
];

const PAYMENT_REMINDER_SUBJECT_MARKERS = ["Payment Reminder", "GCR"];

export type ConferencePaymentCommunicationIndex = {
  paymentLinkSentSubmissionIds: Set<string>;
  paymentLinkSentRegistrationIds: Set<string>;
  paymentReminderSentSubmissionIds: Set<string>;
  paymentReminderSentRegistrationIds: Set<string>;
};

function toRecord(data: FirebaseFirestore.DocumentData): Record<string, unknown> {
  return data as Record<string, unknown>;
}

function isSentLog(data: Record<string, unknown>): boolean {
  return String(data.deliveryStatus ?? "sent") === "sent";
}

function collectTemplateIds(
  templatesSnap: FirebaseFirestore.QuerySnapshot
): {
  paymentLinkTemplateIds: Set<string>;
  paymentReminderTemplateIds: Set<string>;
} {
  const paymentLinkTemplateIds = new Set<string>([PAYMENT_LINK_TEMPLATE_SEED]);
  const paymentReminderTemplateIds = new Set<string>([PAYMENT_REMINDER_TEMPLATE_SEED]);

  for (const doc of templatesSnap.docs) {
    const data = doc.data();
    const seedKey = String(data.seedKey ?? "");
    const name = String(data.name ?? "");
    const subject = String(data.subject ?? "");

    if (
      seedKey === PAYMENT_LINK_TEMPLATE_SEED ||
      name === PAYMENT_LINK_TEMPLATE_NAME ||
      subject === PAYMENT_LINK_SUBJECT
    ) {
      paymentLinkTemplateIds.add(doc.id);
    }

    if (
      seedKey === PAYMENT_REMINDER_TEMPLATE_SEED ||
      name === PAYMENT_REMINDER_TEMPLATE_NAME ||
      subject === PAYMENT_REMINDER_SUBJECT ||
      (subject.includes("Payment Reminder") && subject.includes("GCR"))
    ) {
      paymentReminderTemplateIds.add(doc.id);
    }
  }

  return { paymentLinkTemplateIds, paymentReminderTemplateIds };
}

function isPaymentLinkLog(
  data: Record<string, unknown>,
  paymentLinkTemplateIds: Set<string>
): boolean {
  if (!isSentLog(data)) return false;
  const template = String(data.template ?? "");
  const subject = String(data.subject ?? "");
  const type = String(data.type ?? "");
  const channel = String(data.channel ?? "");
  const manualCommunication =
    type === "individual" ||
    type === "bulk_campaign" ||
    channel === "individual" ||
    channel === "bulk";

  return (
    paymentLinkTemplateIds.has(template) ||
    subject === PAYMENT_LINK_SUBJECT ||
    (manualCommunication &&
      LEGACY_PAYMENT_LINK_SUBJECT_PARTS.every((part) => subject.includes(part)))
  );
}

function isPaymentReminderLog(
  data: Record<string, unknown>,
  paymentReminderTemplateIds: Set<string>
): boolean {
  if (!isSentLog(data)) return false;
  const template = String(data.template ?? "");
  const subject = String(data.subject ?? "");
  return (
    paymentReminderTemplateIds.has(template) ||
    PAYMENT_REMINDER_SUBJECT_MARKERS.every((part) => subject.includes(part))
  );
}

export async function loadConferencePaymentCommunicationIndex(
  db: Firestore
): Promise<ConferencePaymentCommunicationIndex> {
  const [logsSnap, templatesSnap] = await Promise.all([
    db.collection("email_logs").limit(3000).get(),
    db.collection("emailTemplates").get(),
  ]);

  const { paymentLinkTemplateIds, paymentReminderTemplateIds } =
    collectTemplateIds(templatesSnap);

  const paymentLinkSentSubmissionIds = new Set<string>();
  const paymentLinkSentRegistrationIds = new Set<string>();
  const paymentReminderSentSubmissionIds = new Set<string>();
  const paymentReminderSentRegistrationIds = new Set<string>();

  for (const doc of logsSnap.docs) {
    const data = toRecord(doc.data());
    const registrationId = String(data.registrationId ?? "").trim();
    const submissionId = String(data.submissionId ?? "").trim();

    if (isPaymentLinkLog(data, paymentLinkTemplateIds)) {
      if (registrationId) paymentLinkSentRegistrationIds.add(registrationId);
      if (submissionId) paymentLinkSentSubmissionIds.add(submissionId);
    }

    if (isPaymentReminderLog(data, paymentReminderTemplateIds)) {
      if (registrationId) paymentReminderSentRegistrationIds.add(registrationId);
      if (submissionId) paymentReminderSentSubmissionIds.add(submissionId);
    }
  }

  return {
    paymentLinkSentSubmissionIds,
    paymentLinkSentRegistrationIds,
    paymentReminderSentSubmissionIds,
    paymentReminderSentRegistrationIds,
  };
}

export function isPaymentLinkSentForSubmission(
  sub: Pick<
    Submission,
    | "id"
    | "registrationId"
    | "submissionPurpose"
    | "status"
    | "paymentLinkSent"
  >,
  index: ConferencePaymentCommunicationIndex
): boolean {
  if (sub.paymentLinkSent) return true;
  if (sub.submissionPurpose !== "conference" || sub.status !== "accepted") return false;
  if (index.paymentLinkSentSubmissionIds.has(sub.id)) return true;
  return index.paymentLinkSentRegistrationIds.has(sub.registrationId);
}

export function isPaymentReminderSentForSubmission(
  sub: Pick<
    Submission,
    | "id"
    | "registrationId"
    | "submissionPurpose"
    | "status"
    | "paymentReminderSent"
  >,
  index: ConferencePaymentCommunicationIndex
): boolean {
  if (sub.paymentReminderSent) return true;
  if (sub.submissionPurpose !== "conference" || sub.status !== "accepted") return false;
  if (index.paymentReminderSentSubmissionIds.has(sub.id)) return true;
  return index.paymentReminderSentRegistrationIds.has(sub.registrationId);
}

export type YesNoFilter = "all" | "yes" | "no";

export function matchesYesNoFilter(value: boolean, filter: YesNoFilter | undefined): boolean {
  if (!filter || filter === "all") return true;
  return filter === "yes" ? value : !value;
}

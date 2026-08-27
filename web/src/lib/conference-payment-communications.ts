import type { Firestore, Timestamp } from "firebase-admin/firestore";
import type { Submission } from "@/types/dashboard";
import { formatIstDateTime } from "@/lib/conference-deadline";

export const PAYMENT_LINK_TEMPLATE_SEED = "conference_q3_2026_payment_link";
export const PAYMENT_LINK_TEMPLATE_NAME = "Payment Link - GCR Conference July–September 2026";
export const PAYMENT_LINK_SUBJECT = "Payment Link - GCR International Conference Q3 2026";

export const PAYMENT_REMINDER_TEMPLATE_SEED = "conference_payment_reminder";
export const PAYMENT_REMINDER_TEMPLATE_NAME =
  "Payment Reminder – GCR Conference Registration";
export const PAYMENT_REMINDER_SUBJECT =
  "Payment Reminder – GCR Conference Registration Deadline: 28 August 2026";

export const ZOOM_LINKS_TEMPLATE_SEED = "conference_zoom_links";
export const ZOOM_LINKS_TEMPLATE_NAME =
  "Zoom link for GCR Colloquia/Workshop and Conference";
export const ZOOM_LINKS_SUBJECT = "Zoom link for GCR Colloquia/Workshop and Conference";

const LEGACY_PAYMENT_LINK_SUBJECT_PARTS = [
  "Payment Link",
  "GCR International Conference Q3",
  "September 2026",
];

const PAYMENT_REMINDER_SUBJECT_MARKERS = ["Payment Reminder", "GCR"];
const ZOOM_LINKS_SUBJECT_MARKERS = ["Zoom link", "GCR"];

export type ConferencePaymentCommunicationIndex = {
  paymentLinkSentSubmissionIds: Set<string>;
  paymentLinkSentRegistrationIds: Set<string>;
  paymentReminderSentSubmissionIds: Set<string>;
  paymentReminderSentRegistrationIds: Set<string>;
  zoomLinksSentSubmissionIds: Set<string>;
  zoomLinksSentRegistrationIds: Set<string>;
  paymentReminderLatestBySubmissionId: Map<string, string>;
  paymentReminderLatestByRegistrationId: Map<string, string>;
  zoomLinksLatestBySubmissionId: Map<string, string>;
  zoomLinksLatestByRegistrationId: Map<string, string>;
};

function toRecord(data: FirebaseFirestore.DocumentData): Record<string, unknown> {
  return data as Record<string, unknown>;
}

function isSentLog(data: Record<string, unknown>): boolean {
  return String(data.deliveryStatus ?? "sent") === "sent";
}

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

function collectTemplateIds(templatesSnap: FirebaseFirestore.QuerySnapshot): {
  paymentLinkTemplateIds: Set<string>;
  paymentReminderTemplateIds: Set<string>;
  zoomLinksTemplateIds: Set<string>;
} {
  const paymentLinkTemplateIds = new Set<string>([PAYMENT_LINK_TEMPLATE_SEED]);
  const paymentReminderTemplateIds = new Set<string>([PAYMENT_REMINDER_TEMPLATE_SEED]);
  const zoomLinksTemplateIds = new Set<string>([ZOOM_LINKS_TEMPLATE_SEED]);

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
      PAYMENT_REMINDER_SUBJECT_MARKERS.every((part) => subject.includes(part))
    ) {
      paymentReminderTemplateIds.add(doc.id);
    }

    if (
      seedKey === ZOOM_LINKS_TEMPLATE_SEED ||
      name === ZOOM_LINKS_TEMPLATE_NAME ||
      subject === ZOOM_LINKS_SUBJECT ||
      ZOOM_LINKS_SUBJECT_MARKERS.every((part) => subject.includes(part))
    ) {
      zoomLinksTemplateIds.add(doc.id);
    }
  }

  return { paymentLinkTemplateIds, paymentReminderTemplateIds, zoomLinksTemplateIds };
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
  if (String(data.actionType ?? "") === "PAYMENT_REMINDER") return true;
  const template = String(data.template ?? "");
  const subject = String(data.subject ?? "");
  return (
    paymentReminderTemplateIds.has(template) ||
    PAYMENT_REMINDER_SUBJECT_MARKERS.every((part) => subject.includes(part))
  );
}

function isZoomLinksLog(
  data: Record<string, unknown>,
  zoomLinksTemplateIds: Set<string>
): boolean {
  if (!isSentLog(data)) return false;
  if (String(data.actionType ?? "") === "ZOOM_LINKS") return true;
  const template = String(data.template ?? "");
  const subject = String(data.subject ?? "");
  return (
    zoomLinksTemplateIds.has(template) ||
    ZOOM_LINKS_SUBJECT_MARKERS.every((part) => subject.includes(part))
  );
}

function recordLatest(
  mapSub: Map<string, string>,
  mapReg: Map<string, string>,
  submissionId: string,
  registrationId: string,
  createdAt: string
): void {
  if (submissionId) {
    const prev = mapSub.get(submissionId);
    if (!prev || createdAt > prev) mapSub.set(submissionId, createdAt);
  }
  if (registrationId) {
    const prev = mapReg.get(registrationId);
    if (!prev || createdAt > prev) mapReg.set(registrationId, createdAt);
  }
}

export async function loadConferencePaymentCommunicationIndex(
  db: Firestore
): Promise<ConferencePaymentCommunicationIndex> {
  const [logsSnap, templatesSnap] = await Promise.all([
    db.collection("email_logs").limit(3000).get(),
    db.collection("emailTemplates").get(),
  ]);

  const { paymentLinkTemplateIds, paymentReminderTemplateIds, zoomLinksTemplateIds } =
    collectTemplateIds(templatesSnap);

  const paymentLinkSentSubmissionIds = new Set<string>();
  const paymentLinkSentRegistrationIds = new Set<string>();
  const paymentReminderSentSubmissionIds = new Set<string>();
  const paymentReminderSentRegistrationIds = new Set<string>();
  const zoomLinksSentSubmissionIds = new Set<string>();
  const zoomLinksSentRegistrationIds = new Set<string>();
  const paymentReminderLatestBySubmissionId = new Map<string, string>();
  const paymentReminderLatestByRegistrationId = new Map<string, string>();
  const zoomLinksLatestBySubmissionId = new Map<string, string>();
  const zoomLinksLatestByRegistrationId = new Map<string, string>();

  for (const doc of logsSnap.docs) {
    const data = toRecord(doc.data());
    const registrationId = String(data.registrationId ?? "").trim();
    const submissionId = String(data.submissionId ?? "").trim();
    const createdAt = toIso(data.createdAt);
    if (!createdAt) continue;

    if (isPaymentLinkLog(data, paymentLinkTemplateIds)) {
      if (registrationId) paymentLinkSentRegistrationIds.add(registrationId);
      if (submissionId) paymentLinkSentSubmissionIds.add(submissionId);
    }

    if (isPaymentReminderLog(data, paymentReminderTemplateIds)) {
      if (registrationId) paymentReminderSentRegistrationIds.add(registrationId);
      if (submissionId) paymentReminderSentSubmissionIds.add(submissionId);
      recordLatest(
        paymentReminderLatestBySubmissionId,
        paymentReminderLatestByRegistrationId,
        submissionId,
        registrationId,
        createdAt
      );
    }

    if (isZoomLinksLog(data, zoomLinksTemplateIds)) {
      if (registrationId) zoomLinksSentRegistrationIds.add(registrationId);
      if (submissionId) zoomLinksSentSubmissionIds.add(submissionId);
      recordLatest(
        zoomLinksLatestBySubmissionId,
        zoomLinksLatestByRegistrationId,
        submissionId,
        registrationId,
        createdAt
      );
    }
  }

  return {
    paymentLinkSentSubmissionIds,
    paymentLinkSentRegistrationIds,
    paymentReminderSentSubmissionIds,
    paymentReminderSentRegistrationIds,
    zoomLinksSentSubmissionIds,
    zoomLinksSentRegistrationIds,
    paymentReminderLatestBySubmissionId,
    paymentReminderLatestByRegistrationId,
    zoomLinksLatestBySubmissionId,
    zoomLinksLatestByRegistrationId,
  };
}

export function getLatestPaymentReminderSentAt(
  submissionId: string,
  registrationId: string,
  index: ConferencePaymentCommunicationIndex
): { sent: boolean; sentAt: string | null } {
  const iso =
    index.paymentReminderLatestBySubmissionId.get(submissionId) ??
    index.paymentReminderLatestByRegistrationId.get(registrationId) ??
    null;
  return { sent: Boolean(iso), sentAt: iso ? formatIstDateTime(iso) : null };
}

export function getLatestZoomLinksSentAt(
  submissionId: string,
  registrationId: string,
  index: ConferencePaymentCommunicationIndex
): { sent: boolean; sentAt: string | null } {
  const iso =
    index.zoomLinksLatestBySubmissionId.get(submissionId) ??
    index.zoomLinksLatestByRegistrationId.get(registrationId) ??
    null;
  return { sent: Boolean(iso), sentAt: iso ? formatIstDateTime(iso) : null };
}

export function isPaymentLinkSentForSubmission(
  sub: Pick<
    Submission,
    "id" | "registrationId" | "submissionPurpose" | "status" | "paymentLinkSent"
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
    "id" | "registrationId" | "submissionPurpose" | "status" | "paymentReminderSent"
  >,
  index: ConferencePaymentCommunicationIndex
): boolean {
  if (sub.paymentReminderSent) return true;
  if (sub.submissionPurpose !== "conference" || sub.status !== "accepted") return false;
  if (index.paymentReminderSentSubmissionIds.has(sub.id)) return true;
  return index.paymentReminderSentRegistrationIds.has(sub.registrationId);
}

export function isZoomLinksSentForSubmission(
  sub: Pick<
    Submission,
    "id" | "registrationId" | "submissionPurpose" | "paymentCompleted" | "zoomLinkSent"
  > & { zoomLinkSent?: boolean },
  index: ConferencePaymentCommunicationIndex
): boolean {
  if (sub.zoomLinkSent) return true;
  if (sub.submissionPurpose !== "conference" || !sub.paymentCompleted) return false;
  if (index.zoomLinksSentSubmissionIds.has(sub.id)) return true;
  return index.zoomLinksSentRegistrationIds.has(sub.registrationId);
}

export type YesNoFilter = "all" | "yes" | "no";

export function matchesYesNoFilter(value: boolean, filter: YesNoFilter | undefined): boolean {
  if (!filter || filter === "all") return true;
  return filter === "yes" ? value : !value;
}

export function timestampToIst(value: Timestamp | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : value.toDate();
  return formatIstDateTime(date);
}

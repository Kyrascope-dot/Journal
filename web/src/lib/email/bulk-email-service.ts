import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { emailService } from "@/lib/email/email-service";
import { DEFAULT_BULK_TEMPLATES, htmlToPlainText } from "@/lib/email/bulk-templates";
import { getSiteBaseUrl } from "@/lib/email/reviewer-invitation";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { siteConfig } from "@/lib/site-config";
import type {
  CampaignDeliveryStatus,
  CampaignRecipientPreview,
  CampaignStatus,
  CommunicationChannel,
  CommunicationHistoryItem,
  CommunicationsStats,
  CreateCampaignPayload,
  EmailCampaignSummary,
  EmailTemplateRecord,
  PersonalizationContext,
  PersonalizedEmailPreview,
  RecipientFilters,
  SendIndividualPayload,
} from "@/types/communications";
import {
  CONFERENCE_AWARD_LABELS,
  CONFERENCE_QUARTER_LABELS,
  getEmailStatusLabel,
  type ConferenceAwardIntent,
  type ConferenceQuarter,
  type SubmissionPurpose,
  type SubmissionStatus,
} from "@/types/dashboard";

export const BULK_QUEUE_THRESHOLD = 50;
export const BULK_BATCH_SIZE = 25;

type SubmissionDoc = {
  id: string;
  registrationId?: string;
  title?: string;
  abstract?: string;
  submissionPurpose?: SubmissionPurpose;
  conferenceQuarter?: ConferenceQuarter | null;
  conferenceAwardIntent?: ConferenceAwardIntent | null;
  authorName?: string;
  authorEmail?: string;
  affiliation?: string;
  category?: string;
  status?: SubmissionStatus;
  submittedAt?: { toDate(): Date } | Timestamp | null;
  assignedEditorId?: string | null;
  assignedEditorName?: string | null;
  assignedReviewerId?: string | null;
  assignedReviewerName?: string | null;
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

function submittedAtMs(value: SubmissionDoc["submittedAt"]): number | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "object" && "toDate" in value) {
    return value.toDate().getTime();
  }
  return null;
}

function parseDayBound(isoDate: string, endOfDay: boolean): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const date = endOfDay
    ? new Date(Date.UTC(y, m, d, 23, 59, 59, 999))
    : new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  return date.getTime();
}

function formatSubmittedAt(value: SubmissionDoc["submittedAt"]): string {
  const ms = submittedAtMs(value);
  if (ms == null) return "";
  return new Date(ms).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function buildPersonalizationContext(sub: SubmissionDoc): PersonalizationContext {
  const purpose: SubmissionPurpose =
    sub.submissionPurpose === "conference" ? "conference" : "journal";
  const status = (sub.status ?? "pending") as SubmissionStatus;
  const award = sub.conferenceAwardIntent ?? null;
  const quarter = sub.conferenceQuarter ?? null;

  return {
    authorName: String(sub.authorName ?? ""),
    authorEmail: String(sub.authorEmail ?? ""),
    registrationId: String(sub.registrationId ?? sub.id),
    title: String(sub.title ?? ""),
    abstract: String(sub.abstract ?? ""),
    category: String(sub.category ?? ""),
    status,
    statusLabel: getEmailStatusLabel(status, purpose),
    affiliation: String(sub.affiliation ?? ""),
    submissionPurpose: purpose,
    conferenceQuarter: quarter ? CONFERENCE_QUARTER_LABELS[quarter] : "",
    conferenceAwardIntent: award ? CONFERENCE_AWARD_LABELS[award] : "",
    assignedEditorName: String(sub.assignedEditorName ?? ""),
    assignedReviewerName: String(sub.assignedReviewerName ?? ""),
    submittedAt: formatSubmittedAt(sub.submittedAt),
    journalName: siteConfig.name,
    dashboardUrl: `${getSiteBaseUrl()}/dashboard?view=author`,
  };
}

/**
 * Friendly aliases from the Bulk Email brief → stored context keys.
 * Unknown placeholders resolve to empty strings.
 */
const VARIABLE_ALIASES: Record<string, string> = {
  Author_Name: "authorName",
  Author_Email: "authorEmail",
  Registration_ID: "registrationId",
  Paper_Title: "title",
  Paper_ID: "registrationId",
  Conference_Name: "journalName",
  Track: "category",
  Decision: "statusLabel",
  Submission_Date: "submittedAt",
  Editor_Name: "assignedEditorName",
  Reviewer_Name: "assignedReviewerName",
  Volume: "volume",
  Issue: "issue",
  DOI: "doi",
  Publication_Date: "publicationDate",
  Conference_Date: "conferenceDate",
  Presentation_Time: "presentationTime",
  Zoom_Link: "zoomLink",
  Certificate_Link: "certificateLink",
};

/** Replace {{var}} tokens; unknown placeholders become empty strings. */
export function personalizeTemplate(
  template: string,
  context: Record<string, string>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const resolvedKey = VARIABLE_ALIASES[key] ?? key;
    const value = context[resolvedKey] ?? context[key];
    return value == null ? "" : String(value);
  });
}

export function matchesRecipientFilters(
  sub: SubmissionDoc,
  filters: RecipientFilters
): boolean {
  const purpose =
    sub.submissionPurpose === "conference" ? "conference" : "journal";
  if (purpose !== filters.purpose) return false;

  if (filters.statuses?.length) {
    if (!sub.status || !filters.statuses.includes(sub.status)) return false;
  }

  if (filters.category && sub.category !== filters.category) return false;

  if (filters.registrationId) {
    const needle = filters.registrationId.trim().toLowerCase();
    const reg = String(sub.registrationId ?? sub.id).toLowerCase();
    if (!reg.includes(needle)) return false;
  }

  if (filters.authorName) {
    const needle = filters.authorName.trim().toLowerCase();
    if (!String(sub.authorName ?? "").toLowerCase().includes(needle)) return false;
  }

  if (filters.authorEmail) {
    const needle = filters.authorEmail.trim().toLowerCase();
    if (!String(sub.authorEmail ?? "").toLowerCase().includes(needle)) return false;
  }

  if (filters.dateFrom) {
    const from = parseDayBound(filters.dateFrom, false);
    const submitted = submittedAtMs(sub.submittedAt);
    if (from != null && (submitted == null || submitted < from)) return false;
  }

  if (filters.dateTo) {
    const to = parseDayBound(filters.dateTo, true);
    const submitted = submittedAtMs(sub.submittedAt);
    if (to != null && (submitted == null || submitted > to)) return false;
  }

  if (filters.purpose === "conference") {
    if (filters.conferenceQuarter) {
      if (sub.conferenceQuarter !== filters.conferenceQuarter) return false;
    }
    if (filters.bestPaperNominees) {
      const award = sub.conferenceAwardIntent;
      if (award !== "best_paper" && award !== "both") return false;
    }
  }

  if (filters.purpose === "journal") {
    if (filters.assignedEditorId) {
      if (sub.assignedEditorId !== filters.assignedEditorId) return false;
    }
    if (filters.assignedReviewerId) {
      if (sub.assignedReviewerId !== filters.assignedReviewerId) return false;
    }
  }

  return true;
}

async function loadAllSubmissions(): Promise<SubmissionDoc[]> {
  const snap = await getAdminFirestore().collection("submissions").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<SubmissionDoc, "id">) }));
}

export async function resolveRecipients(
  filters: RecipientFilters
): Promise<CampaignRecipientPreview[]> {
  const all = await loadAllSubmissions();
  return all
    .filter((sub) => matchesRecipientFilters(sub, filters))
    .filter((sub) => Boolean(String(sub.authorEmail ?? "").trim()))
    .map((sub) => ({
      submissionId: sub.id,
      registrationId: String(sub.registrationId ?? sub.id),
      authorName: String(sub.authorName ?? ""),
      authorEmail: String(sub.authorEmail ?? "").trim(),
      title: String(sub.title ?? ""),
      status: (sub.status ?? "pending") as SubmissionStatus,
      category: String(sub.category ?? ""),
      submissionPurpose: (sub.submissionPurpose === "conference"
        ? "conference"
        : "journal") as SubmissionPurpose,
    }))
    .sort((a, b) => a.registrationId.localeCompare(b.registrationId));
}

function serializeCampaign(
  id: string,
  data: FirebaseFirestore.DocumentData
): EmailCampaignSummary {
  return {
    id,
    name: String(data.name ?? "Untitled campaign"),
    purpose: data.purpose === "conference" ? "conference" : "journal",
    subject: String(data.subject ?? ""),
    status: data.status as CampaignStatus,
    filters: (data.filters ?? { purpose: "journal" }) as RecipientFilters,
    templateId: data.templateId ? String(data.templateId) : null,
    totalRecipients: Number(data.totalRecipients ?? 0),
    sentCount: Number(data.sentCount ?? 0),
    failedCount: Number(data.failedCount ?? 0),
    pendingCount: Number(data.pendingCount ?? 0),
    batchSize: Number(data.batchSize ?? BULK_BATCH_SIZE),
    queueThreshold: Number(data.queueThreshold ?? BULK_QUEUE_THRESHOLD),
    scheduledFor: toIso(data.scheduledFor),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdById: String(data.createdById ?? ""),
    createdByEmail: String(data.createdByEmail ?? ""),
    lastProcessedAt: toIso(data.lastProcessedAt),
    error: data.error ? String(data.error) : null,
  };
}

function serializeTemplate(
  id: string,
  data: FirebaseFirestore.DocumentData
): EmailTemplateRecord {
  return {
    id,
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    audience: (data.audience ?? "both") as EmailTemplateRecord["audience"],
    subject: String(data.subject ?? ""),
    bodyHtml: String(data.bodyHtml ?? ""),
    bodyText: String(data.bodyText ?? ""),
    variables: Array.isArray(data.variables)
      ? data.variables.map(String)
      : [...DEFAULT_BULK_TEMPLATES[0]!.variables],
    isDefault: Boolean(data.isDefault),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdById: data.createdById ? String(data.createdById) : null,
  };
}

export async function ensureDefaultTemplates(
  createdById?: string
): Promise<EmailTemplateRecord[]> {
  const db = getAdminFirestore();
  const col = db.collection("emailTemplates");
  const existing = await col.get();
  const bySeed = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const doc of existing.docs) {
    const seedKey = doc.data().seedKey;
    if (seedKey) bySeed.set(String(seedKey), doc);
  }

  const writes: Promise<unknown>[] = [];
  for (const seed of DEFAULT_BULK_TEMPLATES) {
    if (bySeed.has(seed.seedKey)) continue;
    writes.push(
      col.add({
        seedKey: seed.seedKey,
        name: seed.name,
        description: seed.description,
        audience: seed.audience,
        subject: seed.subject,
        bodyHtml: seed.bodyHtml,
        bodyText: seed.bodyText,
        variables: seed.variables,
        isDefault: true,
        createdById: createdById ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    );
  }
  if (writes.length) await Promise.all(writes);

  const snap = await col.orderBy("name", "asc").get();
  return snap.docs.map((doc) => serializeTemplate(doc.id, doc.data()));
}

export async function listTemplates(): Promise<EmailTemplateRecord[]> {
  return ensureDefaultTemplates();
}

export async function createOrUpdateTemplate(input: {
  id?: string;
  name: string;
  description?: string;
  audience: EmailTemplateRecord["audience"];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  createdById: string;
}): Promise<EmailTemplateRecord> {
  const db = getAdminFirestore();
  const bodyText = input.bodyText?.trim() || htmlToPlainText(input.bodyHtml);
  const payload = {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    audience: input.audience,
    subject: input.subject.trim(),
    bodyHtml: input.bodyHtml,
    bodyText,
    variables: DEFAULT_BULK_TEMPLATES[0]!.variables,
    isDefault: false,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.id) {
    const ref = db.doc(`emailTemplates/${input.id}`);
    const existing = await ref.get();
    const existingData = existing.data() ?? {};
    await ref.set(
      {
        ...payload,
        isDefault: Boolean(existingData.isDefault),
        ...(existingData.seedKey ? { seedKey: existingData.seedKey } : {}),
      },
      { merge: true }
    );
    const snap = await ref.get();
    return serializeTemplate(ref.id, snap.data() ?? payload);
  }

  const ref = await db.collection("emailTemplates").add({
    ...payload,
    createdById: input.createdById,
    createdAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  return serializeTemplate(ref.id, snap.data() ?? payload);
}

export async function previewPersonalizedEmails(
  filters: RecipientFilters,
  subject: string,
  bodyHtml: string,
  bodyText: string | undefined,
  limit = 10
): Promise<{
  count: number;
  recipients: CampaignRecipientPreview[];
  previews: PersonalizedEmailPreview[];
}> {
  const recipients = await resolveRecipients(filters);
  const all = await loadAllSubmissions();
  const byId = new Map(all.map((s) => [s.id, s]));
  const textSource = bodyText?.trim() || htmlToPlainText(bodyHtml);

  const previews: PersonalizedEmailPreview[] = [];
  for (const recipient of recipients.slice(0, limit)) {
    const sub = byId.get(recipient.submissionId);
    if (!sub) continue;
    const ctx = buildPersonalizationContext(sub);
    previews.push({
      submissionId: recipient.submissionId,
      registrationId: recipient.registrationId,
      to: recipient.authorEmail,
      subject: personalizeTemplate(subject, ctx),
      html: personalizeTemplate(bodyHtml, ctx),
      text: personalizeTemplate(textSource, ctx),
    });
  }

  return { count: recipients.length, recipients: recipients.slice(0, limit), previews };
}

async function writeEmailLog(entry: {
  type: string;
  channel: CommunicationChannel;
  campaignId?: string | null;
  submissionId?: string | null;
  registrationId: string;
  recipient: string;
  subject: string;
  template?: string | null;
  deliveryStatus: string;
  providerMessageId?: string | null;
  error?: string | null;
}): Promise<void> {
  await getAdminFirestore().collection("email_logs").add({
    type: entry.type,
    channel: entry.channel,
    campaignId: entry.campaignId ?? null,
    submissionId: entry.submissionId ?? null,
    registrationId: entry.registrationId,
    recipient: entry.recipient,
    subject: entry.subject,
    template: entry.template ?? null,
    deliveryStatus: entry.deliveryStatus,
    providerMessageId: entry.providerMessageId ?? null,
    error: entry.error ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function sendPersonalized(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ messageId: string | null }> {
  const result = await emailService.send({ to, subject, html, text });
  return { messageId: result.messageId };
}

export async function sendTestEmail(input: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  sampleSubmissionId?: string | null;
}): Promise<{ sent: true; messageId: string | null }> {
  let ctx: PersonalizationContext = {
    authorName: "Test Author",
    authorEmail: input.to,
    registrationId: "GCRJ-TEST-000000",
    title: "Sample manuscript title",
    abstract: "Sample abstract for test email.",
    category: "Economics & Management",
    status: "pending",
    statusLabel: "Submitted",
    affiliation: "Sample University",
    submissionPurpose: "journal",
    conferenceQuarter: "",
    conferenceAwardIntent: "",
    assignedEditorName: "",
    assignedReviewerName: "",
    submittedAt: new Date().toLocaleString("en-GB"),
    journalName: siteConfig.name,
    dashboardUrl: `${getSiteBaseUrl()}/dashboard?view=author`,
  };

  if (input.sampleSubmissionId) {
    const snap = await getAdminFirestore()
      .doc(`submissions/${input.sampleSubmissionId}`)
      .get();
    if (snap.exists) {
      ctx = buildPersonalizationContext({
        id: snap.id,
        ...(snap.data() as Omit<SubmissionDoc, "id">),
      });
    }
  }

  const textSource = input.bodyText?.trim() || htmlToPlainText(input.bodyHtml);
  const subject = personalizeTemplate(input.subject, ctx);
  const html = personalizeTemplate(input.bodyHtml, ctx);
  const text = personalizeTemplate(textSource, ctx);
  const result = await sendPersonalized(input.to, subject, html, text);
  await writeEmailLog({
    type: "bulk_test",
    channel: "test",
    registrationId: ctx.registrationId,
    recipient: input.to,
    subject,
    deliveryStatus: "sent",
    providerMessageId: result.messageId,
  });
  return { sent: true, messageId: result.messageId };
}

export async function createCampaign(
  admin: { uid: string; email: string },
  payload: CreateCampaignPayload
): Promise<{
  campaign: EmailCampaignSummary;
  queued: boolean;
  processedImmediately: boolean;
  processResult?: Awaited<ReturnType<typeof processCampaignBatch>>;
}> {
  const filters: RecipientFilters = {
    ...payload.filters,
    purpose: payload.purpose,
  };
  const recipients = await resolveRecipients(filters);
  if (payload.action !== "draft" && recipients.length === 0) {
    throw new Error("No recipients match the selected filters.");
  }

  const bodyText = payload.bodyText?.trim() || htmlToPlainText(payload.bodyHtml);
  const name =
    payload.name?.trim() ||
    `${payload.purpose === "conference" ? "Conference" : "Journal"} — ${payload.subject.slice(0, 60)}`;

  let status: CampaignStatus = "draft";
  let scheduledFor: Timestamp | null = null;

  if (payload.action === "schedule") {
    if (!payload.scheduledFor) throw new Error("scheduledFor is required for schedule.");
    const when = new Date(payload.scheduledFor);
    if (Number.isNaN(when.getTime())) throw new Error("Invalid scheduledFor datetime.");
    scheduledFor = Timestamp.fromDate(when);
    status = "scheduled";
  } else if (payload.action === "send") {
    status = recipients.length > BULK_QUEUE_THRESHOLD ? "queued" : "sending";
  }

  const db = getAdminFirestore();
  const campaignRef = db.collection("emailCampaigns").doc();
  await campaignRef.set({
    name,
    purpose: payload.purpose,
    filters,
    subject: payload.subject,
    bodyHtml: payload.bodyHtml,
    bodyText,
    templateId: payload.templateId ?? null,
    status,
    totalRecipients: recipients.length,
    sentCount: 0,
    failedCount: 0,
    pendingCount: payload.action === "draft" ? 0 : recipients.length,
    batchSize: BULK_BATCH_SIZE,
    queueThreshold: BULK_QUEUE_THRESHOLD,
    scheduledFor,
    createdById: admin.uid,
    createdByEmail: admin.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastProcessedAt: null,
    error: null,
  });

  if (payload.action !== "draft" && recipients.length > 0) {
    const all = await loadAllSubmissions();
    const byId = new Map(all.map((s) => [s.id, s]));
    let batch = db.batch();
    let ops = 0;
    for (const recipient of recipients) {
      const sub = byId.get(recipient.submissionId);
      const ctx = sub
        ? buildPersonalizationContext(sub)
        : buildPersonalizationContext({
            id: recipient.submissionId,
            registrationId: recipient.registrationId,
            authorName: recipient.authorName,
            authorEmail: recipient.authorEmail,
            title: recipient.title,
            status: recipient.status,
            category: recipient.category,
            submissionPurpose: recipient.submissionPurpose,
          });
      const ref = campaignRef.collection("recipients").doc();
      batch.set(ref, {
        submissionId: recipient.submissionId,
        registrationId: recipient.registrationId,
        email: recipient.authorEmail,
        authorName: recipient.authorName,
        personalizedSubject: personalizeTemplate(payload.subject, ctx),
        personalizedHtml: personalizeTemplate(payload.bodyHtml, ctx),
        personalizedText: personalizeTemplate(bodyText, ctx),
        status: "pending" satisfies CampaignDeliveryStatus,
        error: null,
        providerMessageId: null,
        sentAt: null,
        createdAt: FieldValue.serverTimestamp(),
      });
      ops += 1;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();
  }

  let processResult: Awaited<ReturnType<typeof processCampaignBatch>> | undefined;
  let processedImmediately = false;

  if (payload.action === "send") {
    if (recipients.length <= BULK_QUEUE_THRESHOLD) {
      processResult = await processCampaignBatch(campaignRef.id);
      processedImmediately = true;
      // Keep processing until done or empty pending for small campaigns
      while (
        processResult.campaign.status === "sending" ||
        processResult.campaign.status === "queued"
      ) {
        if (processResult.processed === 0) break;
        processResult = await processCampaignBatch(campaignRef.id);
      }
    }
  }

  if (payload.testEmail?.trim()) {
    await sendTestEmail({
      to: payload.testEmail.trim(),
      subject: payload.subject,
      bodyHtml: payload.bodyHtml,
      bodyText,
      sampleSubmissionId: recipients[0]?.submissionId ?? null,
    });
  }

  const snap = await campaignRef.get();
  return {
    campaign: serializeCampaign(campaignRef.id, snap.data() ?? {}),
    queued: status === "queued" || status === "scheduled",
    processedImmediately,
    processResult,
  };
}

export async function listCampaigns(limit = 50): Promise<EmailCampaignSummary[]> {
  const snap = await getAdminFirestore()
    .collection("emailCampaigns")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => serializeCampaign(doc.id, doc.data()));
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Export campaign recipient delivery log as CSV. */
export async function exportCampaignCsv(campaignId: string): Promise<{
  filename: string;
  csv: string;
}> {
  const db = getAdminFirestore();
  const campaignRef = db.doc(`emailCampaigns/${campaignId}`);
  const campaignSnap = await campaignRef.get();
  if (!campaignSnap.exists) throw new Error("Campaign not found.");

  const campaign = serializeCampaign(campaignId, campaignSnap.data() ?? {});
  const recipientsSnap = await campaignRef.collection("recipients").get();
  const header = [
    "registrationId",
    "authorName",
    "email",
    "status",
    "error",
    "providerMessageId",
    "sentAt",
    "submissionId",
  ];
  const rows = recipientsSnap.docs.map((doc) => {
    const data = doc.data();
    return [
      String(data.registrationId ?? ""),
      String(data.authorName ?? ""),
      String(data.email ?? ""),
      String(data.status ?? ""),
      String(data.error ?? ""),
      String(data.providerMessageId ?? ""),
      toIso(data.sentAt) ?? "",
      String(data.submissionId ?? ""),
    ]
      .map((cell) => csvEscape(cell))
      .join(",");
  });

  const safeName = campaign.name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40);
  return {
    filename: `campaign-${safeName || campaignId}.csv`,
    csv: [header.join(","), ...rows].join("\n"),
  };
}

export async function processCampaignBatch(campaignId: string): Promise<{
  campaign: EmailCampaignSummary;
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
}> {
  const db = getAdminFirestore();
  const campaignRef = db.doc(`emailCampaigns/${campaignId}`);
  const campaignSnap = await campaignRef.get();
  if (!campaignSnap.exists) throw new Error("Campaign not found.");

  const campaign = campaignSnap.data()!;
  const status = campaign.status as CampaignStatus;

  if (status === "draft" || status === "cancelled" || status === "completed") {
    return {
      campaign: serializeCampaign(campaignId, campaign),
      processed: 0,
      sent: 0,
      failed: 0,
      remaining: Number(campaign.pendingCount ?? 0),
    };
  }

  if (status === "scheduled") {
    const scheduled = campaign.scheduledFor as Timestamp | undefined;
    if (scheduled && scheduled.toMillis() > Date.now()) {
      return {
        campaign: serializeCampaign(campaignId, campaign),
        processed: 0,
        sent: 0,
        failed: 0,
        remaining: Number(campaign.pendingCount ?? 0),
      };
    }
  }

  await campaignRef.update({
    status: "sending",
    updatedAt: FieldValue.serverTimestamp(),
  });

  const pendingSnap = await campaignRef
    .collection("recipients")
    .where("status", "==", "pending")
    .limit(BULK_BATCH_SIZE)
    .get();

  let sent = 0;
  let failed = 0;

  for (const doc of pendingSnap.docs) {
    const data = doc.data();
    try {
      const result = await sendPersonalized(
        String(data.email),
        String(data.personalizedSubject),
        String(data.personalizedHtml),
        String(data.personalizedText)
      );
      await doc.ref.update({
        status: "sent",
        providerMessageId: result.messageId,
        sentAt: FieldValue.serverTimestamp(),
        error: null,
      });
      await writeEmailLog({
        type: "bulk_campaign",
        channel: "bulk",
        campaignId,
        submissionId: data.submissionId ? String(data.submissionId) : null,
        registrationId: String(data.registrationId ?? ""),
        recipient: String(data.email),
        subject: String(data.personalizedSubject),
        template: campaign.templateId ? String(campaign.templateId) : "bulk_campaign",
        deliveryStatus: "sent",
        providerMessageId: result.messageId,
      });
      if (data.submissionId) {
        await db.doc(`submissions/${data.submissionId}`).set(
          {
            lastEmailSent: FieldValue.serverTimestamp(),
            lastEmailTemplate: "bulk_campaign",
            emailStatus: "sent",
            emailTimestamp: FieldValue.serverTimestamp(),
            deliveryStatus: "sent",
          },
          { merge: true }
        );
      }
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Send failed.";
      await doc.ref.update({
        status: "failed",
        error: message,
      });
      await writeEmailLog({
        type: "bulk_campaign",
        channel: "bulk",
        campaignId,
        submissionId: data.submissionId ? String(data.submissionId) : null,
        registrationId: String(data.registrationId ?? ""),
        recipient: String(data.email),
        subject: String(data.personalizedSubject ?? campaign.subject),
        template: campaign.templateId ? String(campaign.templateId) : "bulk_campaign",
        deliveryStatus: "failed",
        error: message,
      });
      failed += 1;
    }
  }

  const remainingSnap = await campaignRef
    .collection("recipients")
    .where("status", "==", "pending")
    .limit(1)
    .get();
  const remainingEstimate = remainingSnap.empty
    ? 0
    : Math.max(
        0,
        Number(campaign.pendingCount ?? 0) - sent - failed
      );

  const nextStatus: CampaignStatus = remainingSnap.empty ? "completed" : "queued";
  await campaignRef.update({
    sentCount: FieldValue.increment(sent),
    failedCount: FieldValue.increment(failed),
    pendingCount: FieldValue.increment(-(sent + failed)),
    status: nextStatus,
    lastProcessedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    error: failed > 0 && nextStatus === "completed" ? "Completed with failures." : null,
  });

  const refreshed = await campaignRef.get();
  return {
    campaign: serializeCampaign(campaignId, refreshed.data() ?? {}),
    processed: sent + failed,
    sent,
    failed,
    remaining: remainingEstimate,
  };
}

export async function sendIndividualEmail(
  admin: { uid: string; email: string },
  payload: SendIndividualPayload
): Promise<{ sent: true; messageId: string | null }> {
  const db = getAdminFirestore();
  const snap = await db.doc(`submissions/${payload.submissionId}`).get();
  if (!snap.exists) throw new Error("Submission not found.");
  const sub: SubmissionDoc = { id: snap.id, ...(snap.data() as Omit<SubmissionDoc, "id">) };
  const to = String(sub.authorEmail ?? "").trim();
  if (!to) throw new Error("Submission has no author email.");

  const ctx = buildPersonalizationContext(sub);
  const bodyText = payload.bodyText?.trim() || htmlToPlainText(payload.bodyHtml);
  const subject = personalizeTemplate(payload.subject, ctx);
  const html = personalizeTemplate(payload.bodyHtml, ctx);
  const text = personalizeTemplate(bodyText, ctx);

  const result = await sendPersonalized(to, subject, html, text);
  await writeEmailLog({
    type: "individual",
    channel: "individual",
    submissionId: sub.id,
    registrationId: ctx.registrationId,
    recipient: to,
    subject,
    template: payload.templateId ?? "individual",
    deliveryStatus: "sent",
    providerMessageId: result.messageId,
  });
  await snap.ref.set(
    {
      lastEmailSent: FieldValue.serverTimestamp(),
      lastEmailTemplate: payload.templateId ?? "individual",
      emailStatus: "sent",
      emailTimestamp: FieldValue.serverTimestamp(),
      deliveryStatus: "sent",
    },
    { merge: true }
  );

  // Track lightweight individual campaign log row for admin history
  await db.collection("emailCampaigns").add({
    name: `Individual — ${ctx.registrationId}`,
    purpose: sub.submissionPurpose === "conference" ? "conference" : "journal",
    filters: { purpose: sub.submissionPurpose === "conference" ? "conference" : "journal" },
    subject,
    bodyHtml: html,
    bodyText: text,
    templateId: payload.templateId ?? null,
    status: "completed" satisfies CampaignStatus,
    totalRecipients: 1,
    sentCount: 1,
    failedCount: 0,
    pendingCount: 0,
    batchSize: 1,
    queueThreshold: BULK_QUEUE_THRESHOLD,
    scheduledFor: null,
    createdById: admin.uid,
    createdByEmail: admin.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastProcessedAt: FieldValue.serverTimestamp(),
    error: null,
    channel: "individual",
    submissionId: sub.id,
  });

  return { sent: true, messageId: result.messageId };
}

export async function getCommunicationHistory(
  submissionId: string
): Promise<CommunicationHistoryItem[]> {
  const snap = await getAdminFirestore()
    .collection("email_logs")
    .where("submissionId", "==", submissionId)
    .limit(50)
    .get();

  const items = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: String(data.type ?? ""),
      channel: String(data.channel ?? data.type ?? ""),
      campaignId: data.campaignId ? String(data.campaignId) : null,
      submissionId: data.submissionId ? String(data.submissionId) : null,
      registrationId: String(data.registrationId ?? data.submissionId ?? "—"),
      recipient: String(data.recipient ?? ""),
      subject: String(data.subject ?? data.type ?? ""),
      template: data.template ? String(data.template) : null,
      deliveryStatus: String(data.deliveryStatus ?? "sent"),
      error: data.error ? String(data.error) : null,
      createdAt: toIso(data.createdAt),
    } satisfies CommunicationHistoryItem;
  });

  return items.sort((a, b) => {
    const am = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bm = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bm - am;
  });
}

export async function getCommunicationsStats(): Promise<CommunicationsStats> {
  const [campaigns, templates] = await Promise.all([
    listCampaigns(100),
    listTemplates(),
  ]);

  const emailsSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const emailsFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);

  return {
    totalCampaigns: campaigns.length,
    drafts: campaigns.filter((c) => c.status === "draft").length,
    queued: campaigns.filter((c) => c.status === "queued" || c.status === "scheduled").length,
    sending: campaigns.filter((c) => c.status === "sending").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    failed: campaigns.filter((c) => c.status === "failed").length,
    emailsSent,
    emailsFailed,
    templateCount: templates.length,
    recentCampaigns: campaigns.slice(0, 8),
  };
}

/** Process due scheduled campaigns (called opportunistically from list/stats). */
export async function processDueScheduledCampaigns(max = 3): Promise<number> {
  const snap = await getAdminFirestore()
    .collection("emailCampaigns")
    .where("status", "==", "scheduled")
    .limit(max)
    .get();

  let started = 0;
  for (const doc of snap.docs) {
    const scheduled = doc.data().scheduledFor as Timestamp | undefined;
    if (scheduled && scheduled.toMillis() > Date.now()) continue;
    await doc.ref.update({
      status: "queued",
      updatedAt: FieldValue.serverTimestamp(),
    });
    await processCampaignBatch(doc.id);
    started += 1;
  }
  return started;
}

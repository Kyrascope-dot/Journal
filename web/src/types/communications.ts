import type {
  ConferenceQuarter,
  SubmissionPurpose,
  SubmissionStatus,
} from "@/types/dashboard";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "sending"
  | "completed"
  | "failed"
  | "cancelled";

export type CampaignDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export type TemplateAudience = "conference" | "journal" | "both";

export type CommunicationChannel = "bulk" | "individual" | "test";

export type RecipientFilters = {
  purpose: SubmissionPurpose;
  /** Empty / omitted = all statuses for that purpose. */
  statuses?: SubmissionStatus[];
  /** Conference: nominees with award intent best_paper or both. */
  bestPaperNominees?: boolean;
  /** Conference: filter by award nomination category. */
  conferenceAwardIntent?: "best_paper" | "best_presenter" | "both";
  /** Conference: registration payment completed. */
  paymentCompleted?: "yes" | "no";
  /** Conference: payment link email sent. */
  paymentLinkSent?: "yes" | "no";
  /** Conference: payment reminder email sent. */
  paymentReminderSent?: "yes" | "no";
  category?: string;
  registrationId?: string;
  authorName?: string;
  authorEmail?: string;
  /** ISO date (YYYY-MM-DD), inclusive start of day. */
  dateFrom?: string;
  /** ISO date (YYYY-MM-DD), inclusive end of day. */
  dateTo?: string;
  /** Conference quarter filter (Q3 button defaults to q3). */
  conferenceQuarter?: ConferenceQuarter;
  /** Journal: filter by assigned editor uid. */
  assignedEditorId?: string;
  /** Journal: filter by assigned reviewer uid. */
  assignedReviewerId?: string;
};

export type EmailTemplateRecord = {
  id: string;
  name: string;
  description: string;
  audience: TemplateAudience;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  createdById: string | null;
};

export type CampaignRecipientPreview = {
  submissionId: string;
  registrationId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  status: SubmissionStatus;
  category: string;
  submissionPurpose: SubmissionPurpose;
};

export type PersonalizedEmailPreview = {
  submissionId: string;
  registrationId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailCampaignSummary = {
  id: string;
  name: string;
  purpose: SubmissionPurpose;
  subject: string;
  status: CampaignStatus;
  filters: RecipientFilters;
  templateId: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  batchSize: number;
  queueThreshold: number;
  scheduledFor: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdById: string;
  createdByEmail: string;
  lastProcessedAt: string | null;
  error: string | null;
};

export type CampaignRecipientRecord = {
  id: string;
  submissionId: string;
  registrationId: string;
  email: string;
  authorName: string;
  status: CampaignDeliveryStatus;
  error: string | null;
  providerMessageId: string | null;
  sentAt: string | null;
};

export type CommunicationHistoryItem = {
  id: string;
  type: string;
  channel: CommunicationChannel | string;
  campaignId: string | null;
  submissionId: string | null;
  registrationId: string;
  recipient: string;
  subject: string;
  template: string | null;
  deliveryStatus: string;
  error: string | null;
  createdAt: string | null;
};

export type CommunicationsStats = {
  totalCampaigns: number;
  drafts: number;
  queued: number;
  sending: number;
  completed: number;
  failed: number;
  emailsSent: number;
  emailsFailed: number;
  templateCount: number;
  recentCampaigns: EmailCampaignSummary[];
};

/** Known merge fields available for personalization. */
export const COMMUNICATION_VARIABLES = [
  "authorName",
  "authorEmail",
  "coAuthors",
  "registrationId",
  "title",
  "abstract",
  "category",
  "status",
  "statusLabel",
  "affiliation",
  "submissionPurpose",
  "conferenceQuarter",
  "conferenceAwardIntent",
  "conferenceTrack",
  "conferenceFeeWaiver",
  "assignedEditorName",
  "assignedReviewerName",
  "submittedAt",
  "journalName",
  "dashboardUrl",
  "paymentLink",
] as const;

export type CommunicationVariable = (typeof COMMUNICATION_VARIABLES)[number];

/** Tokens shown in the composer (includes friendly aliases). */
export const COMMUNICATION_VARIABLE_INSERTS = [
  ...COMMUNICATION_VARIABLES,
  "Author_Name",
  "Registration_ID",
  "Paper_Title",
  "Paper_ID",
  "Track",
  "Decision",
  "Conference_Name",
  "Editor_Name",
  "Submission_Date",
] as const;

export type PersonalizationContext = Record<CommunicationVariable, string> &
  Record<string, string>;

export type CreateCampaignPayload = {
  name?: string;
  purpose: SubmissionPurpose;
  filters: RecipientFilters;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string | null;
  action: "draft" | "send" | "schedule";
  scheduledFor?: string | null;
  testEmail?: string | null;
};

export type SendIndividualPayload = {
  submissionId: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string | null;
  previewOnly?: boolean;
};

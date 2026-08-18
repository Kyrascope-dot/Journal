import type { Timestamp } from "firebase/firestore";

export type UserRole = "scholar" | "editor" | "reviewer" | "admin";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  affiliation?: string;
  /** Editor only: which research categories they are assigned to review */
  assignedCategories?: string[];
  createdAt: Timestamp | Date | null;
};

export type SubmissionStatus =
  | "pending"
  | "editorial_screening"
  | "desk_rejected"
  | "under_review"
  | "revision_requested"
  | "accepted"
  | "rejected";

export type SubmissionPurpose = "journal" | "conference";

export type EmailStatus = "pending" | "sent" | "failed" | "not_required";
export type DeliveryStatus = "queued" | "sent" | "failed" | "not_applicable";

export const SUBMISSION_PURPOSE_OPTIONS: {
  value: SubmissionPurpose;
  label: string;
}[] = [
  { value: "journal", label: "Submit for journal publication" },
  { value: "conference", label: "Submit for conference" },
];

export const SUBMISSION_PURPOSE_LABELS: Record<SubmissionPurpose, string> = {
  journal: "Journal",
  conference: "Conference",
};

export type ConferenceQuarter = "q1" | "q2" | "q3" | "q4";

export const CONFERENCE_QUARTER_OPTIONS: {
  value: ConferenceQuarter;
  label: string;
}[] = [
  { value: "q1", label: "Q1 (Jan–Mar) issue" },
  { value: "q2", label: "Q2 (Apr–Jun) issue" },
  { value: "q3", label: "Q3 (Jul–Sep) issue" },
  { value: "q4", label: "Q4 (Oct–Dec) issue" },
];

export const CONFERENCE_QUARTER_LABELS: Record<ConferenceQuarter, string> = {
  q1: "Q1 (Jan–Mar) issue",
  q2: "Q2 (Apr–Jun) issue",
  q3: "Q3 (Jul–Sep) issue",
  q4: "Q4 (Oct–Dec) issue",
};

export type ConferenceAwardIntent = "best_paper" | "best_presenter" | "both";

export const CONFERENCE_AWARD_OPTIONS: {
  value: ConferenceAwardIntent;
  label: string;
}[] = [
  { value: "best_paper", label: "Best Paper Award" },
  { value: "best_presenter", label: "Best Presenter Award" },
  { value: "both", label: "Both (Best Paper & Best Presenter)" },
];

export const CONFERENCE_AWARD_LABELS: Record<ConferenceAwardIntent, string> = {
  best_paper: "Best Paper Award",
  best_presenter: "Best Presenter Award",
  both: "Best Paper & Best Presenter",
};

export type ConferenceTrack =
  | "track_1"
  | "track_2"
  | "track_3"
  | "track_4"
  | "track_5";

export type ConferenceFeeWaiver = "none" | "full" | "partial";

export const CONFERENCE_TRACK_OPTIONS: {
  value: ConferenceTrack;
  label: string;
}[] = [
  { value: "track_1", label: "Track 1" },
  { value: "track_2", label: "Track 2" },
  { value: "track_3", label: "Track 3" },
  { value: "track_4", label: "Track 4" },
  { value: "track_5", label: "Track 5" },
];

export const CONFERENCE_TRACK_LABELS: Record<ConferenceTrack, string> = {
  track_1: "Track 1",
  track_2: "Track 2",
  track_3: "Track 3",
  track_4: "Track 4",
  track_5: "Track 5",
};

export const CONFERENCE_FEE_WAIVER_OPTIONS: {
  value: ConferenceFeeWaiver;
  label: string;
}[] = [
  { value: "none", label: "No Waiver" },
  { value: "full", label: "Full Fee Waiver" },
  { value: "partial", label: "Partial Fee Waiver" },
];

export const CONFERENCE_FEE_WAIVER_LABELS: Record<ConferenceFeeWaiver, string> = {
  none: "No Waiver",
  full: "Full Fee Waiver",
  partial: "Partial Fee Waiver",
};

/** Short line for lists (conference quarter + award). Empty for journal-only rows. */
export function formatConferenceSubmissionMeta(sub: {
  submissionPurpose: SubmissionPurpose;
  conferenceQuarter: ConferenceQuarter | null;
  conferenceAwardIntent: ConferenceAwardIntent | null;
  conferenceTrack?: ConferenceTrack | null;
  conferenceFeeWaiver?: ConferenceFeeWaiver | null;
}): string {
  if (sub.submissionPurpose !== "conference") return "";
  const parts: string[] = [];
  if (sub.conferenceQuarter) {
    parts.push(CONFERENCE_QUARTER_LABELS[sub.conferenceQuarter]);
  }
  if (sub.conferenceAwardIntent) {
    parts.push(CONFERENCE_AWARD_LABELS[sub.conferenceAwardIntent]);
  }
  if (sub.conferenceTrack) {
    parts.push(CONFERENCE_TRACK_LABELS[sub.conferenceTrack]);
  }
  if (sub.conferenceFeeWaiver && sub.conferenceFeeWaiver !== "none") {
    parts.push(CONFERENCE_FEE_WAIVER_LABELS[sub.conferenceFeeWaiver]);
  }
  return parts.length ? parts.join(" · ") : "";
}

export type Submission = {
  id: string;
  /** Permanent, human-facing identifier (for example GCRJ-2026-000001). */
  registrationId: string;
  title: string;
  abstract: string;
  /** Whether the author intends this for the journal or a conference. */
  submissionPurpose: SubmissionPurpose;
  /** Conference only: which quarterly issue. */
  conferenceQuarter: ConferenceQuarter | null;
  /** Conference only: award nomination intent. */
  conferenceAwardIntent: ConferenceAwardIntent | null;
  /** Conference only: programme track assignment (admin). */
  conferenceTrack: ConferenceTrack | null;
  /** Conference only: fee waiver classification (admin). */
  conferenceFeeWaiver: ConferenceFeeWaiver | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  affiliation: string;
  category: string;
  status: SubmissionStatus;
  submittedAt: Timestamp | Date | null;
  lastUpdatedAt: Timestamp | Date | null;
  reviewDeadline: Timestamp | Date | null;
  assignedEditorId: string | null;
  assignedEditorName: string | null;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  statusNote: string | null;
  lastEmailSent: Timestamp | Date | null;
  lastEmailTemplate: string | null;
  emailStatus: EmailStatus;
  emailTimestamp: Timestamp | Date | null;
  deliveryStatus: DeliveryStatus;
};

export type SubmissionStatusEvent = {
  id: string;
  registrationId: string;
  status: SubmissionStatus;
  note: string | null;
  createdAt: Timestamp | Date | null;
  changedByName: string;
  changedByRole: UserRole;
};

export type Comment = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: Timestamp | Date | null;
};

export const RESEARCH_CATEGORIES = [
  "Economics & Management",
  "Law, History & Cultural Studies",
  "Anthropology & Sociology",
  "Psychology & Education",
  "Communication & Peace Studies",
  "Science, Technology, Engineering & Mathematics (STEM)",
] as const;

export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Submitted",
  editorial_screening: "Under Editorial Screening",
  desk_rejected: "Desk Rejected",
  under_review: "Sent for Peer Review",
  revision_requested: "Revision Requested",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700",
  editorial_screening: "bg-sky-50 text-sky-700",
  desk_rejected: "bg-red-50 text-red-700",
  under_review: "bg-blue-50 text-blue-700",
  revision_requested: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export function getSubmissionStatusLabel(
  status: SubmissionStatus,
  purpose: SubmissionPurpose
): string {
  if (purpose === "conference") {
    if (status === "accepted") return "Abstract Accepted";
    if (status === "rejected") return "Abstract Rejected";
    if (status === "pending") return "Abstract Submitted";
  }
  return STATUS_LABELS[status];
}

/** Plain status labels for email merge fields (no "Abstract …" prefix). */
export function getEmailStatusLabel(
  status: SubmissionStatus,
  purpose: SubmissionPurpose
): string {
  if (purpose === "conference") {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    if (status === "pending") return "Submitted";
  }
  return STATUS_LABELS[status];
}

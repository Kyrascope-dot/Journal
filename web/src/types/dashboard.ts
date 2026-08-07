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
  | "under_review"
  | "revision_requested"
  | "accepted"
  | "rejected";

export type SubmissionPurpose = "journal" | "conference";

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

/** Short line for lists (conference quarter + award). Empty for journal-only rows. */
export function formatConferenceSubmissionMeta(sub: {
  submissionPurpose: SubmissionPurpose;
  conferenceQuarter: ConferenceQuarter | null;
  conferenceAwardIntent: ConferenceAwardIntent | null;
}): string {
  if (sub.submissionPurpose !== "conference") return "";
  const parts: string[] = [];
  if (sub.conferenceQuarter) {
    parts.push(CONFERENCE_QUARTER_LABELS[sub.conferenceQuarter]);
  }
  if (sub.conferenceAwardIntent) {
    parts.push(CONFERENCE_AWARD_LABELS[sub.conferenceAwardIntent]);
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
  pending: "Pending",
  under_review: "Under Review",
  revision_requested: "Revision Requested",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700",
  under_review: "bg-blue-50 text-blue-700",
  revision_requested: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

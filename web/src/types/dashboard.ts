import type { Timestamp } from "firebase/firestore";

export type UserRole = "scholar" | "editor" | "admin";

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

export type Submission = {
  id: string;
  title: string;
  abstract: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  affiliation: string;
  category: string;
  status: SubmissionStatus;
  submittedAt: Timestamp | Date | null;
  lastUpdatedAt: Timestamp | Date | null;
  assignedEditorId: string | null;
  assignedEditorName: string | null;
  statusNote: string | null;
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

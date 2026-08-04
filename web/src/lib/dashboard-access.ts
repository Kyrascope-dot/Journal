import type { Submission, UserRole } from "@/types/dashboard";

export type DashboardView = "author" | "editor" | "reviewer" | "admin";

export type DashboardNavLink = { href: string; label: string; view: DashboardView };

const AUTHOR: DashboardNavLink = {
  view: "author",
  href: "/dashboard?view=author",
  label: "Author dashboard",
};

const EDITOR: DashboardNavLink = {
  view: "editor",
  href: "/dashboard?view=editor",
  label: "Editor dashboard",
};

const REVIEWER: DashboardNavLink = {
  view: "reviewer",
  href: "/dashboard?view=reviewer",
  label: "Reviewer dashboard",
};

const ADMIN: DashboardNavLink = {
  view: "admin",
  href: "/dashboard?view=admin",
  label: "Admin dashboard",
};

/** Account menu links shown by role (author dashboard available to all signed-in users). */
export function getDashboardNavLinks(role: UserRole): DashboardNavLink[] {
  const links: DashboardNavLink[] = [AUTHOR];
  if (role === "editor") links.push(EDITOR);
  if (role === "reviewer") links.push(REVIEWER);
  if (role === "admin") links.push(ADMIN);
  return links;
}

export function defaultDashboardView(role: UserRole): DashboardView {
  if (role === "admin") return "admin";
  if (role === "editor") return "editor";
  if (role === "reviewer") return "reviewer";
  return "author";
}

export function canAccessDashboardView(role: UserRole, view: DashboardView): boolean {
  if (view === "author") return true;
  if (view === "admin") return role === "admin";
  if (view === "editor") return role === "editor";
  if (view === "reviewer") return role === "reviewer";
  return false;
}

export type SubmissionVisibilityRole = "scholar" | "editor" | "reviewer" | "admin";

/** Hide peer-reviewer identity from scholars and editors (admin + assigned reviewer only). */
export function submissionForViewer(
  submission: Submission,
  viewerRole: SubmissionVisibilityRole,
  viewerUid: string
): Submission {
  if (viewerRole === "admin") return submission;
  if (viewerRole === "reviewer" && submission.assignedReviewerId === viewerUid) {
    return submission;
  }
  return {
    ...submission,
    assignedReviewerId: null,
    assignedReviewerName: null,
  };
}

export function reviewerLabelForAdmin(submission: Submission): string | null {
  return submission.assignedReviewerName ?? null;
}

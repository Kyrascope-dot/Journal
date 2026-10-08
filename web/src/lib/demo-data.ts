// import type { Issue, IssueWithArticles } from "@/types/journal";
// import {
//   vol1LocalArticles,
//   VOL1_FULL_ISSUE_PDF_URL,
// } from "@/lib/local-issue-assets";

// /** Shown when Firebase env vars are missing or Firestore is empty (local preview). */
// export const demoCurrentIssue: IssueWithArticles = {
//   id: "demo-1",
//   volume: 1,
//   issueNumber: 1,
//   year: 2026,
//   monthLabel: "Apr–June",
//   title: "Volume 1, Issue 1 (2026)",
//   archiveDisplayName: "Issue1-Vol1[Apr-June2026]",
//   publishedAt: new Date("2026-05-11"),
//   slug: "vol-1-2026",
//   isCurrent: true,
//   pdfUrl: VOL1_FULL_ISSUE_PDF_URL,
//   articles: vol1LocalArticles,
// };

// /** Archive preview when not using Firebase. */
// export const demoArchiveIssues: IssueWithArticles[] = [demoCurrentIssue];

// /** Issue rows for archive lists (no nested articles). */
// export const demoIssuesList: Issue[] = demoArchiveIssues.map(
//   ({ articles: _a, ...issue }) => issue
// );

// changed-file
import type { Issue, IssueWithArticles } from "@/types/journal";
import { localIssues } from "@/lib/local-issue-assets";

/** Shown when Firebase env vars are missing or Firestore is empty (local preview). */
export const demoCurrentIssue: IssueWithArticles = localIssues[0];

/** Archive preview when not using Firebase. */
export const demoArchiveIssues: IssueWithArticles[] = localIssues;

/** Issue rows for archive lists (no nested articles). */
export const demoIssuesList: Issue[] = demoArchiveIssues.map(
  ({ articles: _a, ...issue }) => issue,
);

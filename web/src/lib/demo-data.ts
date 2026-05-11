import type { Issue, IssueWithArticles } from "@/types/journal";

/** Shown when Firebase env vars are missing or Firestore is empty (local preview). */
export const demoCurrentIssue: IssueWithArticles = {
  id: "demo-1",
  volume: 1,
  issueNumber: 1,
  year: 2026,
  monthLabel: "may",
  title: "Volume 1, Issue 1 (2026)",
  publishedAt: new Date("2026-05-11"),
  slug: "vol-1-2026",
  isCurrent: true,
  pdfUrl: "/GCR_Vol1_Issue1_FINAL.pdf",
  articles: [],
};

/** Archive preview when not using Firebase. */
export const demoArchiveIssues: IssueWithArticles[] = [demoCurrentIssue];

/** Issue rows for archive lists (no nested articles). */
export const demoIssuesList: Issue[] = demoArchiveIssues.map(
  ({ articles: _a, ...issue }) => issue
);

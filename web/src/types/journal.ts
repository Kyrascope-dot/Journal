import type { Timestamp } from "firebase/firestore";

export type Article = {
  id: string;
  title: string;
  authors: string[];
  pageStart: number | string;
  pageEnd: number | string;
  pdfUrl?: string;
  orderIndex: number;
};

export type Issue = {
  id: string;
  volume: number;
  issueNumber: number;
  year: number;
  monthLabel: string;
  title: string;
  /** Shown on the archives page, e.g. Issue1-Vol1[Apr-June2026] */
  archiveDisplayName?: string;
  publishedAt: Timestamp | Date | null;
  slug: string;
  isCurrent?: boolean;
  /** Path or URL to the full-issue PDF, if published. */
  pdfUrl?: string;
};

export type IssueWithArticles = Issue & { articles: Article[] };

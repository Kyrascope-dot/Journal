import type { Timestamp } from "firebase/firestore";

export type Article = {
  id: string;
  title: string;
  authors: string[];
  pageStart: number;
  pageEnd: number;
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
  publishedAt: Timestamp | Date | null;
  slug: string;
  isCurrent?: boolean;
  /** Path or URL to the full-issue PDF, if published. */
  pdfUrl?: string;
};

export type IssueWithArticles = Issue & { articles: Article[] };

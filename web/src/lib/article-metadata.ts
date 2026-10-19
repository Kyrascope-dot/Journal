import { localIssues } from "@/lib/local-issue-assets";
import { siteConfig } from "@/lib/site-config";

/** A published article with the bibliographic details used for its landing page and citation tags. */
export type PublishedArticle = {
  /** Stable id, also the landing-page slug: /articles/<id> */
  id: string;
  title: string;
  /** Author names as printed on the issue page. */
  authors: string[];
  /** Names for citation metadata: roles and honorifics removed. */
  citationAuthors: string[];
  volume: number;
  issueNumber: number;
  year: number;
  /** Issue publication date. */
  publishedAt: Date | null;
  issueSlug: string;
  issueTitle: string;
  firstPage: number | null;
  lastPage: number | null;
  /** Site-relative PDF path, e.g. /Issue1-Vol1%5B...%5D/paper.pdf */
  pdfUrl: string | null;
  landingPath: string;
};

const HONORIFICS = /^(dr|prof|professor|mr|mrs|ms|miss)\.?\s+/i;

/** "Dr Aamna Habib" → "Aamna Habib"; "X (corresponding author)" → "X". */
export function cleanAuthorName(name: string): string {
  let cleaned = name.replace(/\([^)]*\)/g, " ").trim();
  while (HONORIFICS.test(cleaned)) cleaned = cleaned.replace(HONORIFICS, "");
  return cleaned.replace(/\s+/g, " ").trim();
}

function pageNumber(value: number | string): number | null {
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  return null;
}

/** All published articles (from the bundled issue data), newest issue first. */
export function getPublishedArticles(): PublishedArticle[] {
  return localIssues.flatMap((issue) =>
    issue.articles.map((article) => ({
      id: article.id,
      title: article.title,
      authors: article.authors,
      citationAuthors: article.authors.map(cleanAuthorName).filter(Boolean),
      volume: issue.volume,
      issueNumber: issue.issueNumber,
      year: issue.year,
      publishedAt: toDate(issue.publishedAt),
      issueSlug: issue.slug,
      issueTitle: issue.title,
      firstPage: pageNumber(article.pageStart),
      lastPage: pageNumber(article.pageEnd),
      pdfUrl: article.pdfUrl && article.pdfUrl !== "#" ? article.pdfUrl : null,
      landingPath: `/articles/${article.id}`,
    })),
  );
}

export function findPublishedArticle(id: string): PublishedArticle | undefined {
  return getPublishedArticles().find((article) => article.id === id);
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const origin = siteConfig.siteUrl.replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** YYYY/MM/DD, the date format Google Scholar expects. */
function scholarDate(date: Date | null, year: number): string {
  if (!date) return String(year);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())}`;
}

/**
 * Highwire Press citation tags read by Google Scholar (journal, volume, issue,
 * pages, date, authors, PDF). Only fields with real data are included.
 */
export function citationMetaTags(article: PublishedArticle): Record<string, string | string[]> {
  const tags: Record<string, string | string[]> = {
    citation_title: article.title,
    citation_author: article.citationAuthors,
    citation_publication_date: scholarDate(article.publishedAt, article.year),
    citation_journal_title: siteConfig.name,
    citation_publisher: siteConfig.publisherOrganisation,
    citation_volume: String(article.volume),
    citation_issue: String(article.issueNumber),
    citation_language: "en",
    citation_abstract_html_url: absoluteUrl(article.landingPath),
  };
  if (siteConfig.issn) tags.citation_issn = siteConfig.issn;
  if (article.firstPage) tags.citation_firstpage = String(article.firstPage);
  if (article.lastPage) tags.citation_lastpage = String(article.lastPage);
  if (article.pdfUrl) tags.citation_pdf_url = absoluteUrl(article.pdfUrl);
  return tags;
}

/** "Saleem, H. M. U." from "Hafiz Muhammad Umar Saleem"; single names stay as they are. */
function apaName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
  return `${last}, ${initials}`;
}

/** APA-style reference: Authors (Year). Title. Journal, Vol(Issue), pages. URL */
export function formatCitation(article: PublishedArticle): string {
  const names = article.citationAuthors.map(apaName);
  const authors =
    names.length <= 1
      ? names.join("")
      : `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
  const pages =
    article.firstPage && article.lastPage ? `, ${article.firstPage}–${article.lastPage}` : "";
  return `${authors} (${article.year}). ${article.title}. ${siteConfig.name}, ${article.volume}(${article.issueNumber})${pages}. ${absoluteUrl(article.landingPath)}`;
}

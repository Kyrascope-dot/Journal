"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchAllIssues } from "@/lib/firestore-journal";
import { demoIssuesList } from "@/lib/demo-data";
import type { Article, Issue } from "@/types/journal";
import { formatPublished } from "@/lib/format-dates";
import { siteConfig } from "@/lib/site-config";
import {
  getLocalArticlesForIssueSlug,
  SLUGS_WITH_VOL1_LOCAL_PAPERS,
  VOL1_FULL_ISSUE_PDF_URL,
} from "@/lib/local-issue-assets";
import { contentShell, contentProseMeasure } from "@/lib/content-layout";

type IssueRow = Issue & { articles: Article[] };

function enrichIssue(issue: Issue): IssueRow {
  const vol1 =
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.slug) ||
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.id);
  const pdfUrl = vol1 ? VOL1_FULL_ISSUE_PDF_URL : issue.pdfUrl;
  return {
    ...issue,
    pdfUrl,
    articles: getLocalArticlesForIssueSlug(issue),
  };
}
// The client component fetches the list of issues and their metadata, but article-level PDFs are only linked for a few issues (currently just Vol. 1) due to the manual effort required to upload and link each paper. For most issues, only the full issue PDF is available.

export function JournalArchivesClient() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isFirebaseConfigured()) {
        if (!cancelled) {
          setIssues(demoIssuesList);
          setLoading(false);
        }
        return;
      }
      try {
        const list = await fetchAllIssues();
        if (!cancelled) setIssues(list.length ? list : demoIssuesList);
      } catch {
        if (!cancelled) setIssues(demoIssuesList);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = issues.length > 0 ? issues : demoIssuesList;
  const rows: IssueRow[] = list.map(enrichIssue);

  return (
    <div className={`${contentShell} py-10`}>
      <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
        All Issues
      </h1>
      <p
        className={`mt-4 text-[15px] leading-relaxed text-[var(--journal-body)] ${contentProseMeasure}`}
      >
        This archive lists published volumes of <strong>{siteConfig.name}</strong>. Download
        the full issue PDF or expand an entry to open each paper. The issue marked{" "}
        <em>Current</em> is the most recently released compilation.
      </p>
      {loading ? (
        <ul className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </ul>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((issue) => {
            const label =
              issue.archiveDisplayName ??
              `${issue.title} · Vol.${issue.volume} Issue ${issue.issueNumber}`;
            const hasPapers = issue.articles.length > 0;

            return (
              <li
                key={issue.id}
                className="overflow-hidden rounded-xl border border-[var(--journal-border)] bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-[var(--journal-border)] bg-zinc-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/issues/${issue.slug}`}
                        className="font-serif text-lg font-semibold text-[var(--journal-heading)] hover:underline"
                      >
                        {label}
                      </Link>
                      {issue.isCurrent ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--journal-muted)]">
                      Volume {issue.volume}, Issue {issue.issueNumber} · Published{" "}
                      {formatPublished(issue.publishedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {issue.pdfUrl ? (
                      <a
                        href={issue.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-95"
                      >
                        <svg
                          className="h-4 w-4 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Full issue PDF
                      </a>
                    ) : null}
                    <Link
                      href={`/issues/${issue.slug}`}
                      className="inline-flex items-center rounded-md border border-[var(--journal-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
                    >
                      Issue page →
                    </Link>
                  </div>
                </div>

                {hasPapers ? (
                  <details className="group">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-2">
                        <span>Individual papers ({issue.articles.length})</span>
                        <span className="text-[var(--journal-muted)] transition group-open:rotate-180">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </span>
                    </summary>
                    <div className="border-t border-[var(--journal-border)] px-2 pb-2">
                      {issue.articles.map((article) => (
                        <details
                          key={article.id}
                          className="rounded-lg border-b border-[var(--journal-border)] last:border-b-0 open:bg-zinc-50/50"
                        >
                          <summary className="cursor-pointer list-none px-3 py-3 text-left text-sm [&::-webkit-details-marker]:hidden">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 pr-2">
                                <span className="font-medium leading-snug text-[var(--journal-heading)]">
                                  {article.title}
                                </span>
                                {article.authors.length > 0 ? (
                                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--journal-muted)]">
                                    {article.authors.join(", ")}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 text-xs tabular-nums text-[var(--journal-muted)]">
                                pp. {article.pageStart}–{article.pageEnd}
                              </span>
                            </div>
                          </summary>
                          <div className="px-3 pb-3 pt-0">
                            {article.pdfUrl ? (
                              <a
                                href={article.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border border-[var(--journal-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--journal-accent)] transition hover:bg-zinc-50"
                              >
                                Download paper PDF
                              </a>
                            ) : null}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ) : (
                  <p className="px-4 py-3 text-sm text-[var(--journal-muted)]">
                    Paper-level PDFs are not linked for this issue yet.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

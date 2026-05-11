"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchIssueBySlug } from "@/lib/firestore-journal";
import { demoArchiveIssues } from "@/lib/demo-data";
import type { IssueWithArticles } from "@/types/journal";
import { siteConfig } from "@/lib/site-config";
import { ArticleList } from "@/components/journal/ArticleList";
import { formatPublished } from "@/lib/format-dates";

type Props = { slug: string };

export function JournalIssueClient({ slug }: Props) {
  const [issue, setIssue] = useState<IssueWithArticles | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fallback = demoArchiveIssues.find((i) => i.slug === slug) ?? null;
      if (!isFirebaseConfigured()) {
        if (!cancelled) {
          setIssue(fallback);
          setNotFound(!fallback);
          setLoading(false);
        }
        return;
      }
      try {
        const data = await fetchIssueBySlug(slug);
        if (!cancelled) {
          if (data) {
            setIssue(data);
            setNotFound(false);
          } else {
            setIssue(fallback);
            setNotFound(!fallback);
          }
        }
      } catch {
        if (!cancelled) {
          setIssue(fallback);
          setNotFound(!fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-10 max-w-lg animate-pulse rounded bg-zinc-200" />
        <div className="mt-8 h-32 animate-pulse rounded bg-zinc-100" />
      </div>
    );
  }

  if (notFound || !issue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
          Issue not found
        </h1>
        <p className="mt-2 text-sm text-[var(--journal-muted)]">
          There is no issue for this URL yet. Check the archives or add data in Firebase.
        </p>
        <Link
          href="/issues"
          className="mt-6 inline-block text-sm font-medium text-[var(--journal-accent)] hover:underline"
        >
          ← All issues
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-[var(--journal-muted)]">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href="/issues" className="hover:underline">
          Issues
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-[var(--journal-heading)]">
          Volume {issue.volume}
          {issue.issueNumber ? <> · Issue {issue.issueNumber}</> : null}
        </span>
      </nav>

      <header className="mt-6 border-b border-[var(--journal-border)] pb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--journal-muted)]">
          {issue.isCurrent ? "Current issue" : "Issue"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[var(--journal-heading)] sm:text-4xl">
          {issue.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--journal-muted)]">
          {siteConfig.shortName} · Volume {issue.volume}
          {issue.publishedAt ? (
            <> · Published: {formatPublished(issue.publishedAt)}</>
          ) : (
            <> · Publication date to be announced</>
          )}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Full issue
        </h2>
        {issue.pdfUrl ? (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed text-[var(--journal-body)]">
              The complete issue, including all articles, front and back cover pages, is
              available as a single PDF download below.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={issue.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download full issue PDF
              </a>
              <a
                href={issue.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-[var(--journal-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
              >
                <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                View in browser
              </a>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            The complete issue, including front and back cover pages and the full-text PDF,
            will be accessible following final publication. As this is the inaugural issue
            (Volume 1, Issue 1) and is currently forthcoming, all associated files will be
            made available upon completion of the publication process.
          </p>
        )}
      </section>

      {issue.articles.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Main articles
          </h2>
          <ArticleList articles={issue.articles} issueSlug={issue.slug} />
        </section>
      ) : null}
    </div>
  );
}

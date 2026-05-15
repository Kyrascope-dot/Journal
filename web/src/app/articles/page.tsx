import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function AllArticlesPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          All articles
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Every article in <strong>{siteConfig.name}</strong> is assigned to a volume and
          issue and receives a stable page range and digital identifier for citation. Use
          the issue list to browse by publication date, or open the current issue from the
          home page for the latest research.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Browse by issue
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          The most reliable way to explore our archive is through{" "}
          <Link className="text-[var(--journal-accent)] hover:underline" href="/issues">
            all issues
          </Link>
          . Each issue page lists titles, authors, page numbers, and PDF links when
          available. This mirrors how libraries and indexes catalogue the journal.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Search (coming soon)
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          A searchable index of titles, authors, and keywords can be connected to your
          backend (for example Firestore collection group queries on{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">articles</code>
          ). Until then, your browser&apos;s find-on-page (Ctrl+F / ⌘F) on an issue page
          can help locate a specific article.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          How to cite
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Follow your discipline&apos;s style (APA, Chicago, Harvard, etc.). Include
          author names, article title, journal name ({siteConfig.name}), volume, issue,
          page range, year, and DOI or URL when assigned. If you need a formal
          abbreviation for the journal title, use <strong>{siteConfig.shortName}</strong>{" "}
          only where your style guide expects an acronym.
        </p>

        <Link
          href="/issues"
          className="mt-10 inline-flex items-center rounded-md border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-95"
        >
          View all issues
        </Link>
        </div>
      </div>
    </AppShell>
  );
}

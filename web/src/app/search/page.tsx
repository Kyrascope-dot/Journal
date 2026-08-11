import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SiteSearchPageResults } from "@/components/search/SiteSearch";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = {
  title: "Search",
  description: "Search Global Confluence Review pages, conferences, and author resources.",
};

function SearchContent({ query }: { query: string }) {
  return <SiteSearchPageResults initialQuery={query} />;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Search
          </h1>
          <p className="mt-4 text-[15px] text-[var(--journal-body)]">
            Find conference information, author guidelines, editorial board profiles, and other
            public GCR content.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-[var(--journal-muted)]">Loading…</p>}>
              <SearchContent query={query} />
            </Suspense>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { bookOfAbstractsEditions } from "@/lib/book-of-abstracts";

export const metadata = {
  title: "GCR Conference Book of Abstracts",
  description: "Published conference abstracts from Global Confluence Review conferences.",
};

export default function BookOfAbstractsPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            GCR Conference Book of Abstracts
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Accepted conference abstracts are published in the GCR Conference Book of Abstracts.
            Conference presentation does not automatically guarantee publication of a full
            manuscript in Global Confluence Review.
          </p>

          <ul className="mt-8 space-y-4">
            {bookOfAbstractsEditions.map((edition) => (
              <li
                key={edition.id}
                className="rounded-lg border border-[var(--journal-border)] p-5 text-[15px]"
              >
                <h2 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
                  {edition.title}
                </h2>
                {edition.publishedLabel ? (
                  <p className="mt-2 text-[var(--journal-muted)]">{edition.publishedLabel}</p>
                ) : null}
                {edition.stats?.length ? (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {edition.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3"
                      >
                        <dt className="text-sm text-[var(--journal-muted)]">{stat.label}</dt>
                        <dd className="mt-0.5 font-serif text-lg font-semibold text-[var(--journal-heading)]">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {edition.selectionProcess?.length ? (
                  <section className="mt-6">
                    <h3 className="font-serif text-base font-semibold text-[var(--journal-heading)]">
                      Abstract Selection Process
                    </h3>
                    {edition.selectionProcess.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-2 leading-relaxed text-[var(--journal-body)]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ) : null}
                {edition.tracksIntro ? (
                  <section className="mt-6">
                    <h3 className="font-serif text-base font-semibold text-[var(--journal-heading)]">
                      Conference Tracks
                    </h3>
                    <p className="mt-2 leading-relaxed text-[var(--journal-body)]">
                      {edition.tracksIntro}
                      {edition.tracks?.length ? ":" : "."}
                    </p>
                    {edition.tracks?.length ? (
                      <ul className="mt-3 divide-y divide-[var(--journal-border)] rounded border border-[var(--journal-border)] text-sm text-[var(--journal-body)]">
                        {edition.tracks.map((track) => (
                          <li key={track} className="px-4 py-2.5">
                            {track}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ) : null}
                {edition.note ? (
                  <p className="mt-4 text-sm leading-relaxed text-[var(--journal-body)]">
                    {edition.note}
                  </p>
                ) : null}
                {edition.pdfUrl ? (
                  <a
                    href={edition.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                  >
                    Download PDF
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-[var(--journal-body)]">
                    The Book of Abstracts will be published here when available.
                  </p>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-10">
            <Link href="/conferences" className="text-[var(--journal-accent)] hover:underline">
              Back to conferences
            </Link>
            {" · "}
            <Link href="/conferences/payment" className="text-[var(--journal-accent)] hover:underline">
              Conference payment
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  absoluteUrl,
  citationMetaTags,
  findPublishedArticle,
  formatCitation,
  getPublishedArticles,
} from "@/lib/article-metadata";
import { contentProse, contentShell } from "@/lib/content-layout";
import { formatPublished } from "@/lib/format-dates";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ id: string }> };

/** Every published article gets a static landing page; unknown ids return 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedArticles().map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = findPublishedArticle(id);
  if (!article) return {};
  const description = `${article.citationAuthors.join(", ")}. ${siteConfig.name}, Volume ${article.volume}, Issue ${article.issueNumber} (${article.year}).`;
  return {
    title: article.title,
    description,
    alternates: { canonical: article.landingPath },
    openGraph: {
      title: article.title,
      description,
      url: article.landingPath,
      siteName: siteConfig.name,
      type: "article",
    },
    other: citationMetaTags(article),
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = findPublishedArticle(id);
  if (!article) notFound();

  const pages =
    article.firstPage && article.lastPage ? `${article.firstPage}–${article.lastPage}` : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    name: article.title,
    author: article.citationAuthors.map((name) => ({ "@type": "Person", name })),
    datePublished: article.publishedAt?.toISOString().slice(0, 10) ?? String(article.year),
    inLanguage: "en",
    url: absoluteUrl(article.landingPath),
    license: siteConfig.licenseUrl,
    isAccessibleForFree: true,
    ...(article.firstPage ? { pageStart: article.firstPage } : {}),
    ...(article.lastPage ? { pageEnd: article.lastPage } : {}),
    ...(article.pdfUrl
      ? { encoding: { "@type": "MediaObject", contentUrl: absoluteUrl(article.pdfUrl), encodingFormat: "application/pdf" } }
      : {}),
    publisher: { "@type": "Organization", name: siteConfig.publisherOrganisation },
    isPartOf: {
      "@type": "PublicationIssue",
      issueNumber: article.issueNumber,
      url: absoluteUrl(`/issues/${article.issueSlug}`),
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.volume,
        isPartOf: {
          "@type": "Periodical",
          name: siteConfig.name,
          ...(siteConfig.issn ? { issn: siteConfig.issn } : {}),
        },
      },
    },
  };

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={`${contentShell} py-10`}>
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
          <Link href={`/issues/${article.issueSlug}`} className="hover:underline">
            Volume {article.volume} · Issue {article.issueNumber}
          </Link>
        </nav>

        <article className={`mt-6 ${contentProse}`}>
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--journal-muted)]">
            Article
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[var(--journal-heading)]">
            {article.title}
          </h1>
          <p className="mt-4 text-[15px] text-[var(--journal-body)]">
            {article.citationAuthors.join(", ")}
          </p>

          <dl className="mt-6 grid gap-3 border-y border-[var(--journal-border)] py-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[var(--journal-muted)]">Journal</dt>
              <dd>
                {siteConfig.name}
                {siteConfig.issn ? ` (ISSN ${siteConfig.issn})` : ""}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--journal-muted)]">Volume and issue</dt>
              <dd>
                <Link href={`/issues/${article.issueSlug}`} className="text-[var(--journal-accent)] hover:underline">
                  Vol. {article.volume}, Issue {article.issueNumber} ({article.year})
                </Link>
              </dd>
            </div>
            {pages ? (
              <div>
                <dt className="font-medium text-[var(--journal-muted)]">Pages</dt>
                <dd>{pages}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-medium text-[var(--journal-muted)]">Published</dt>
              <dd>{article.publishedAt ? formatPublished(article.publishedAt) : article.year}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--journal-muted)]">Publisher</dt>
              <dd>{siteConfig.publisherOrganisation}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--journal-muted)]">Licence</dt>
              <dd>
                <a
                  href={siteConfig.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer license"
                  className="text-[var(--journal-accent)] hover:underline"
                >
                  {siteConfig.license}
                </a>{" "}
                · © {article.year} The Author(s)
              </dd>
            </div>
          </dl>

          {article.pdfUrl ? (
            <a
              href={article.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
            >
              Download full text (PDF)
            </a>
          ) : null}

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              How to cite
            </h2>
            <p className="mt-3 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-[var(--journal-body)] break-words">
              {formatCitation(article)}
            </p>
          </section>
        </article>
      </div>
    </AppShell>
  );
}

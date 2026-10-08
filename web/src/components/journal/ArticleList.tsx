import Link from "next/link";
import type { Article } from "@/types/journal";

type Props = {
  articles: Article[];
  issueSlug: string;
};

export function ArticleList({ articles, issueSlug }: Props) {
  if (articles.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--journal-muted)]">
        No articles listed for this issue yet.
      </p>
    );
  }

  return (
    <ul className="mt-5 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
      {articles.map((article) => (
        <li
          key={article.id}
          className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-medium leading-snug text-[var(--journal-heading)]">
              <Link
                // href={`/issues/${issueSlug}#${article.id}`}
                href={article.pdfUrl as string}
                target="_blank"
                className="hover:underline"
              >
                {article.title}
              </Link>
            </h3>

            {article.authors.length > 0 ? (
              <p className="mt-1.5 text-sm text-[var(--journal-muted)]">
                {article.authors.join(", ")}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            <span className="text-sm tabular-nums text-[var(--journal-muted)]">
              {article.pageStart}{" "}
              {article.pageStart && article.pageEnd ? "-" : ""}{" "}
              {article.pageEnd}
            </span>
            {article.pdfUrl && article.pdfUrl !== "#" ? (
              <a
                href={article.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-[var(--journal-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--journal-accent)] transition hover:bg-zinc-50"
              >
                PDF
              </a>
            ) : (
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                PDF (add URL in Firebase)
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

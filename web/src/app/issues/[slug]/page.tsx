import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { JournalIssueClient, resolveIssue } from "@/components/journal/JournalIssueClient";
import { formatPublished } from "@/lib/format-dates";
import { getIssnLabel } from "@/lib/journal-settings";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

/** Revalidate hourly so edits to an issue (e.g. added PDF links) go live without a redeploy. */
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await resolveIssue(slug);
  const journalLabel = `${siteConfig.name} (${siteConfig.shortName})`;
  const issueLabel = issue
    ? `Volume ${issue.volume}, Issue ${issue.issueNumber}`
    : "Journal Issue";
  const publicationLabel = issue?.publishedAt
    ? ` Published: ${formatPublished(issue.publishedAt)}.`
    : "";
  const label = issue?.archiveDisplayName ?? issue?.title;
  const title = issue
    ? `${label} | ${journalLabel}`
    : `${issueLabel} | ${journalLabel}`;
  const articleTitles = issue?.articles.slice(0, 5).map((a) => a.title) ?? [];
  const description = articleTitles.length
    ? `${journalLabel}. ${issueLabel}.${publicationLabel} Articles include: ${articleTitles.join("; ")}.`
    : `${journalLabel}. ${getIssnLabel()}. ${issueLabel}.${publicationLabel} Browse the issue contents and full-issue PDF.`;

  return {
    title,
    description,
    keywords: [
      siteConfig.name,
      siteConfig.shortName,
      getIssnLabel(),
      issueLabel,
      "full issue PDF",
      "open access journal issue",
    ],
    alternates: {
      canonical: `/issues/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/issues/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function IssuePage({ params }: Props) {
  const { slug } = await params;
  return (
    <AppShell>
      <JournalIssueClient slug={slug} />
    </AppShell>
  );
}

import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { JournalIssueClient } from "@/components/journal/JournalIssueClient";
import { demoArchiveIssues } from "@/lib/demo-data";
import { formatPublished } from "@/lib/format-dates";
import { getIssnLabel } from "@/lib/journal-settings";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = demoArchiveIssues.find((item) => item.slug === slug);
  const journalLabel = `${siteConfig.name} (${siteConfig.shortName})`;
  const issueLabel = issue
    ? `Volume ${issue.volume}, Issue ${issue.issueNumber}`
    : "Journal Issue";
  const publicationLabel = issue?.publishedAt
    ? ` Published: ${formatPublished(issue.publishedAt)}.`
    : "";
  const title = issue
    ? `${issue.title} | ${journalLabel}`
    : `${issueLabel} | ${journalLabel}`;
  const description = `${journalLabel}. ${getIssnLabel()}. ${issueLabel}.${publicationLabel} Browse the issue contents and full-issue PDF.`;

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
      type: "website",
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

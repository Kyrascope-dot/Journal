import type { MetadataRoute } from "next";
import { getPublicSitemapEntries, getSiteOrigin } from "@/lib/seo";
import { fetchAllIssuesServer } from "@/lib/server/journal-data";
import { demoIssuesList } from "@/lib/demo-data";
import { toDateSafe } from "@/lib/format-dates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = getPublicSitemapEntries().map((entry) => ({
    url: `${origin}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  let issues = await fetchAllIssuesServer();
  if (issues.length === 0) issues = demoIssuesList;

  const issueEntries: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${origin}/issues/${issue.slug}`,
    lastModified: toDateSafe(issue.publishedAt) ?? lastModified,
    changeFrequency: "monthly",
    priority: issue.isCurrent ? 0.9 : 0.75,
  }));

  return [...staticEntries, ...issueEntries];
}

import { forAuthorsSlugs } from "@/content/for-authors-pages";
import { siteConfig } from "@/lib/site-config";

/** Canonical production origin used for sitemap, robots, and metadata. */
export function getSiteOrigin(): string {
  const fromEnv =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    siteConfig.siteUrl?.trim();
  const raw = fromEnv || "https://www.globalconfluencereview.in";
  return raw.replace(/\/$/, "");
}

/**
 * Public SEO description: international open-access journal with a clear
 * pathway for high-school and young researchers.
 */
export const seoDescription =
  "Global Confluence Review (GCR) is an international peer-reviewed open-access multidisciplinary journal (ISSN 3139-6690). GCR supports high-school students, undergraduates, and early-career researchers through the Young Researchers’ Hub, research competitions, and an international conference series.";

export const seoKeywords = [
  "Global Confluence Review",
  "GCR journal",
  "international open access journal",
  "high school research journal",
  "young researchers journal",
  "peer reviewed multidisciplinary journal",
  "high school international conference",
  "student research publication",
  "undergraduate research journal",
  "ISSN 3139-6690",
] as const;

type SitemapEntry = {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

/** Indexable public routes (excludes dashboards, auth, and APIs). */
export function getPublicSitemapEntries(): SitemapEntry[] {
  const staticRoutes: SitemapEntry[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about/journal", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about/aims-and-scope", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about/peer-review", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about/open-access", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about/ethics", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about/abstracting-and-indexing", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about/copyright-and-licensing", changeFrequency: "yearly", priority: 0.6 },
    { path: "/about/archiving-and-preservation", changeFrequency: "yearly", priority: 0.6 },
    { path: "/editorial", changeFrequency: "monthly", priority: 0.85 },
    { path: "/articles", changeFrequency: "weekly", priority: 0.9 },
    { path: "/issues", changeFrequency: "weekly", priority: 0.9 },
    { path: "/issues/vol-1-2026", changeFrequency: "monthly", priority: 0.85 },
    { path: "/research/young-researchers-hub", changeFrequency: "weekly", priority: 0.95 },
    { path: "/research-competitions", changeFrequency: "weekly", priority: 0.9 },
    { path: "/conferences", changeFrequency: "weekly", priority: 0.95 },
    { path: "/conferences/register", changeFrequency: "weekly", priority: 0.85 },
    { path: "/conferences/submit-paper", changeFrequency: "weekly", priority: 0.8 },
    { path: "/conferences/payment", changeFrequency: "monthly", priority: 0.7 },
    { path: "/conferences/faqs", changeFrequency: "monthly", priority: 0.75 },
    { path: "/conferences/book-of-abstracts", changeFrequency: "monthly", priority: 0.7 },
    { path: "/search", changeFrequency: "monthly", priority: 0.5 },
    { path: "/for-authors/manuscript-templates", changeFrequency: "monthly", priority: 0.8 },
    { path: "/submissions", changeFrequency: "monthly", priority: 0.75 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
    { path: "/copyright-notice", changeFrequency: "yearly", priority: 0.3 },
    { path: "/refund-and-cancellation-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/shipping-and-delivery-policy", changeFrequency: "yearly", priority: 0.3 },
  ];

  const authorRoutes: SitemapEntry[] = forAuthorsSlugs.map((slug) => ({
    path: `/for-authors/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const byPath = new Map<string, SitemapEntry>();
  for (const entry of [...staticRoutes, ...authorRoutes]) {
    byPath.set(entry.path, entry);
  }
  return [...byPath.values()];
}

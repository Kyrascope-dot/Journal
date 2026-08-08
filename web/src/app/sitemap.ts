import type { MetadataRoute } from "next";
import { getPublicSitemapEntries, getSiteOrigin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const lastModified = new Date();

  return getPublicSitemapEntries().map((entry) => ({
    url: `${origin}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

import { forAuthorsPages } from "@/content/for-authors-pages";
import { mainNavGroups, topLevelNavLinks } from "@/config/site-navigation";
import {
  colloquiaDetails,
  conferenceOverviewTitle,
  conferenceSpeakers,
} from "@/lib/conference-content";
import { editorialTeam } from "@/data/editorial";

export type SiteSearchResult = {
  title: string;
  href: string;
  snippet: string;
  category: string;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Static index of publicly searchable GCR pages and key phrases. */
export function buildSiteSearchIndex(): SiteSearchResult[] {
  const results: SiteSearchResult[] = [];

  for (const link of topLevelNavLinks) {
    results.push({
      title: link.label,
      href: link.href,
      snippet: `Navigate to ${link.label}.`,
      category: "Site",
    });
  }

  for (const group of mainNavGroups) {
    for (const link of group.links) {
      results.push({
        title: link.label,
        href: link.href,
        snippet: `${group.label} — ${link.label}`,
        category: group.label,
      });
    }
  }

  for (const [slug, page] of Object.entries(forAuthorsPages)) {
    results.push({
      title: page.title,
      href: `/for-authors/${slug}`,
      snippet: page.intro ?? page.sections[0]?.paragraphs[0] ?? "For authors",
      category: "For Authors",
    });
  }

  results.push({
    title: conferenceOverviewTitle,
    href: "/conferences",
    snippet: "GCR Conference series, registration, schedule, speakers, and colloquia.",
    category: "Conferences",
  });

  results.push({
    title: colloquiaDetails.title,
    href: "/conferences#colloquia",
    snippet: `${colloquiaDetails.date} · ${colloquiaDetails.time} · ${colloquiaDetails.mode}`,
    category: "Conferences",
  });

  results.push({
    title: "GCR Conference Book of Abstracts",
    href: "/conferences/book-of-abstracts",
    snippet: "Accepted conference abstracts published in the GCR Conference Book of Abstracts.",
    category: "Conferences",
  });

  for (const speaker of conferenceSpeakers) {
    results.push({
      title: speaker.name,
      href: "/conferences#speakers",
      snippet: `${speaker.role} — ${speaker.affiliation}`,
      category: "Conference Speakers",
    });
  }

  for (const member of editorialTeam) {
    results.push({
      title: member.name,
      href: "/editorial",
      snippet: `${member.headline} — ${member.qualification}`,
      category: "Editorial Board",
    });
  }

  const extraRoutes: SiteSearchResult[] = [
    {
      title: "Young Researchers' Hub",
      href: "/research/young-researchers-hub",
      snippet: "Resources and pathways for school and early-career researchers.",
      category: "Research",
    },
    {
      title: "GCR Research Competitions",
      href: "/research-competitions",
      snippet: "Competitions for young researchers.",
      category: "Research",
    },
    {
      title: "Abstracting and Indexing",
      href: "/about/abstracting-and-indexing",
      snippet: "Indexing status and discoverability for Global Confluence Review.",
      category: "About GCR",
    },
    {
      title: "Contact",
      href: "/contact",
      snippet: "Editorial office contact details.",
      category: "Site",
    },
  ];

  results.push(...extraRoutes);

  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.href + item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function searchSite(query: string, limit = 12): SiteSearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const index = buildSiteSearchIndex();
  const scored = index
    .map((item) => {
      const haystack = normalize(`${item.title} ${item.snippet} ${item.category}`);
      let score = 0;
      if (normalize(item.title) === q) score += 100;
      if (normalize(item.title).startsWith(q)) score += 50;
      if (haystack.includes(q)) score += 20;
      for (const token of q.split(" ")) {
        if (token.length < 2) continue;
        if (normalize(item.title).includes(token)) score += 10;
        if (haystack.includes(token)) score += 3;
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ item }) => item);
}

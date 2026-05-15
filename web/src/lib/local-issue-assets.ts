import type { Article, IssueWithArticles } from "@/types/journal";

/** Full Issue 1 PDF served from `/public` (single compiled volume). */
export const VOL1_FULL_ISSUE_FILENAME = "GCR Issue 1 pdf (1).pdf";

/** Root-level public URL with correct encoding for spaces and parentheses. */
export const VOL1_FULL_ISSUE_PDF_URL =
  "/" + encodeURIComponent(VOL1_FULL_ISSUE_FILENAME);

/** Static folder under `/public` for Volume 1, Issue 1 PDFs (individual papers). */
export const ISSUE_VOL1_PAPERS_FOLDER = "Issue1-Vol1[Apr-June2026]";

/** Slugs (and ids) that map to the bundled Volume 1 / Issue 1 paper set. */
export const SLUGS_WITH_VOL1_LOCAL_PAPERS = new Set([
  "vol-1-2026",
  "demo-1",
  "vol-1-forthcoming",
]);

/** URL-encode each path segment for safe links to `public/` files. */
export function publicAssetUrl(folder: string, filename: string): string {
  return `/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
}

const VOL1_PAPERS: {
  file: string;
  pageStart: number;
  pageEnd: number;
  order: number;
  title: string;
  authors: string[];
}[] = [
  {
    order: 1,
    file: "GCR issue 1 pdf-5-18 paper 1.pdf",
    pageStart: 5,
    pageEnd: 18,
    title:
      "Development and Evaluation of a Bioactive Polyherbal Dermal Formulation Enriched with Niacinamide, Vitamin E and Saffron Extract",
    authors: [
      "Hafiz Muhammad Umar Saleem (corresponding author)",
      "Dr Aamna Habib",
      "Misbah Rasool",
      "Zain Ul Abidin",
      "Abdullah",
    ],
  },
  {
    order: 2,
    file: "GCR issue 1 pdf-19-33 paper 2.pdf",
    pageStart: 19,
    pageEnd: 33,
    title:
      "Beyond CAPM: Operational Efficiency, Market Dynamics, and Sustainable Banking as Drivers of Systematic Risk in Emerging Market Banks",
    authors: ["Tayyaba Rani"],
  },
  {
    order: 3,
    file: "GCR issue 1 pdf-34-50 paper 3.pdf",
    pageStart: 34,
    pageEnd: 50,
    title:
      "Analysis of Interstate Income Inequality of India in Post Reforms Period: An Application of Decomposition Analysis",
    authors: ["Parveen Kumar", "Ombir Singh"],
  },
  {
    order: 4,
    file: "GCR issue 1 pdf-51-77 paper 4.pdf",
    pageStart: 51,
    pageEnd: 77,
    title: "Women in STEM Workforce: Review from Southeast Asian Economies",
    authors: ["Sonam Dobriyal"],
  },
  {
    order: 5,
    file: "GCR issue 1 pdf-78-90 paper 5.pdf",
    pageStart: 78,
    pageEnd: 90,
    title:
      "University Social Responsibility of Higher Educational Institutions in the Global South: A Case of Indian Academia",
    authors: ["Jasleen Kaur"],
  },
];

/** Article rows for TOC / archives. */
export const vol1LocalArticles: Article[] = VOL1_PAPERS.map(
  ({ file, pageStart, pageEnd, order, title, authors }) => ({
    id: `vol1-paper-${order}`,
    title,
    authors,
    pageStart,
    pageEnd,
    pdfUrl: publicAssetUrl(ISSUE_VOL1_PAPERS_FOLDER, file),
    orderIndex: order,
  })
);

export function getLocalArticlesForIssueSlug(issue: {
  slug: string;
  id: string;
}): Article[] {
  if (
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.slug) ||
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.id)
  ) {
    return vol1LocalArticles;
  }
  return [];
}

export function mergeIssueWithLocalPapers(
  issue: IssueWithArticles
): IssueWithArticles {
  const local = getLocalArticlesForIssueSlug(issue);
  const isVol1Bundle =
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.slug) ||
    SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.id);

  let next = issue;
  if (isVol1Bundle) {
    next = { ...next, pdfUrl: VOL1_FULL_ISSUE_PDF_URL };
  }
  if (!local.length) return next;
  if (next.articles.length > 0) return next;
  return { ...next, articles: local };
}

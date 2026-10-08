// import type { Article, IssueWithArticles } from "@/types/journal";

// /** Full Issue 1 PDF served from `/public` (single compiled volume). */
// export const VOL1_FULL_ISSUE_FILENAME = "GCR Issue 1 pdf (1).pdf";

// /** Root-level public URL with correct encoding for spaces and parentheses. */
// export const VOL1_FULL_ISSUE_PDF_URL =
//   "/" + encodeURIComponent(VOL1_FULL_ISSUE_FILENAME);

// /** Static folder under `/public` for Volume 1, Issue 1 PDFs (individual papers). */
// export const ISSUE_VOL1_PAPERS_FOLDER = "Issue1-Vol1[Apr-June2026]";

// /** Slugs (and ids) that map to the bundled Volume 1 / Issue 1 paper set. */
// export const SLUGS_WITH_VOL1_LOCAL_PAPERS = new Set([
//   "vol-1-2026",
//   "demo-1",
//   "vol-1-forthcoming",
// ]);

// /** URL-encode each path segment for safe links to `public/` files. */
// export function publicAssetUrl(folder: string, filename: string): string {
//   return `/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
// }

// const VOL1_PAPERS: {
//   file: string;
//   pageStart: number;
//   pageEnd: number;
//   order: number;
//   title: string;
//   authors: string[];
// }[] = [
//   {
//     order: 1,
//     file: "GCR issue 1 pdf-5-18 paper 1.pdf",
//     pageStart: 5,
//     pageEnd: 18,
//     title:
//       "Development and Evaluation of a Bioactive Polyherbal Dermal Formulation Enriched with Niacinamide, Vitamin E and Saffron Extract",
//     authors: [
//       "Hafiz Muhammad Umar Saleem (corresponding author)",
//       "Dr Aamna Habib",
//       "Misbah Rasool",
//       "Zain Ul Abidin",
//       "Abdullah",
//     ],
//   },
//   {
//     order: 2,
//     file: "GCR issue 1 pdf-19-33 paper 2.pdf",
//     pageStart: 19,
//     pageEnd: 33,
//     title:
//       "Beyond CAPM: Operational Efficiency, Market Dynamics, and Sustainable Banking as Drivers of Systematic Risk in Emerging Market Banks",
//     authors: ["Tayyaba Rani"],
//   },
//   {
//     order: 3,
//     file: "GCR issue 1 pdf-34-50 paper 3.pdf",
//     pageStart: 34,
//     pageEnd: 50,
//     title:
//       "Analysis of Interstate Income Inequality of India in Post Reforms Period: An Application of Decomposition Analysis",
//     authors: ["Parveen Kumar", "Ombir Singh"],
//   },
//   {
//     order: 4,
//     file: "GCR issue 1 pdf-51-77 paper 4.pdf",
//     pageStart: 51,
//     pageEnd: 77,
//     title: "Women in STEM Workforce: Review from Southeast Asian Economies",
//     authors: ["Sonam Dobriyal"],
//   },
//   {
//     order: 5,
//     file: "GCR issue 1 pdf-78-90 paper 5.pdf",
//     pageStart: 78,
//     pageEnd: 90,
//     title:
//       "University Social Responsibility of Higher Educational Institutions in the Global South: A Case of Indian Academia",
//     authors: ["Jasleen Kaur"],
//   },
// ];

// /** Article rows for TOC / archives. */
// export const vol1LocalArticles: Article[] = VOL1_PAPERS.map(
//   ({ file, pageStart, pageEnd, order, title, authors }) => ({
//     id: `vol1-paper-${order}`,
//     title,
//     authors,
//     pageStart,
//     pageEnd,
//     pdfUrl: publicAssetUrl(ISSUE_VOL1_PAPERS_FOLDER, file),
//     orderIndex: order,
//   })
// );

// export function getLocalArticlesForIssueSlug(issue: {
//   slug: string;
//   id: string;
// }): Article[] {
//   if (
//     SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.slug) ||
//     SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.id)
//   ) {
//     return vol1LocalArticles;
//   }
//   return [];
// }

// export function mergeIssueWithLocalPapers(
//   issue: IssueWithArticles
// ): IssueWithArticles {
//   const local = getLocalArticlesForIssueSlug(issue);
//   const isVol1Bundle =
//     SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.slug) ||
//     SLUGS_WITH_VOL1_LOCAL_PAPERS.has(issue.id);

//   let next = issue;
//   if (isVol1Bundle) {
//     next = { ...next, pdfUrl: VOL1_FULL_ISSUE_PDF_URL };
//   }
//   if (!local.length) return next;
//   if (next.articles.length > 0) return next;
//   return { ...next, articles: local };
// }

// changed-file
import type { Article, Issue, IssueWithArticles } from "@/types/journal";
import { toDateSafe } from "@/lib/format-dates";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW ISSUE
 * 1. Put the full-issue PDF in `public/` and the paper PDFs in `public/<folder>/`.
 * 2. Add a papers array below (same shape as VOL1_PAPERS).
 * 3. Add one entry at the TOP of LOCAL_ISSUES that points to that array.
 * Home page, issue page, archives, and sitemap update automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** How many of the newest issues the home page shows (older ones stay in Archives). */
export const HOME_ISSUES_COUNT = 2;

/** One paper inside an issue. `file` is the PDF name inside the issue's folder. */
export type LocalPaper = {
  file: string;
  pageStart: number | string;
  pageEnd: number | string;
  order: number;
  title: string;
  authors: string[];
};

/** One bundled issue: metadata + where its PDFs live + its papers. */
export type LocalIssue = {
  id: string;
  slug: string;
  /** Older slugs / Firestore ids that should resolve to this issue. */
  aliases?: string[];
  volume: number;
  issueNumber: number;
  year: number;
  monthLabel: string;
  title: string;
  /** Shown on the archives page, e.g. Issue1-Vol1[Apr-June2026] */
  archiveDisplayName?: string;
  /** ISO date (YYYY-MM-DD); null while forthcoming. */
  publishedAt: string | null;
  /** Full-issue PDF file name at the root of `/public`. */
  fullIssuePdf?: string;
  /** Folder under `/public` holding the individual paper PDFs. */
  papersFolder: string;
  papers: LocalPaper[];
};

/* ───────────────────────── Volume 1, Issue 1 ───────────────────────── */

const VOL1_PAPERS: LocalPaper[] = [
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

/* ───────────────────────── Volume 1, Issue 2 ───────────────────────── */

// TODO: replace with the real Issue 2 papers
const VOL1_ISSUE2_PAPERS: LocalPaper[] = [
  {
    order: 1,
    file: "Aanika_Asnani.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Strengthening Tribal Consultation in the New Markets Tax Credit Program: APolicy Brief",
    authors: ["Aanika Asnani"],
  },
  {
    order: 2,
    file: "Aaryan_Bakshi.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Low-Cost Carriers and the Transformation of the Indian Domestic Aviation Sector",
    authors: ["Aaryan Bakshi"],
  },
  {
    order: 3,
    file: "Aditya_Gupta.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Policy Paper Closing the Last Mile in Deceased Organ Donation in India: Policy Frameworks, Grassroots Barriers and a District-Level Referral and Family Navigation Model",
    authors: ["Aditya Gupta"],
  },
  {
    order: 4,
    file: "Aryavir_Gulati.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Evaluating Overvalued vs Undervalued F1 Drivers of the 2025 Formula 1 season",
    authors: ["Aryavir Gulati"],
  },
  {
    order: 5,
    file: "Hargun_Kaur.pdf",
    pageStart: "",
    pageEnd: "",
    // title: "ALGORITHMS THAT MANUFACTURE DESIRE: HOW SOCIAL MEDIA CURATION CO-PRODUCES LUXURY TASTE AMONG GENERATION Z",
    title:
      "Algorithms That Manufacture Desire: How Social Media Curation Co-Produces Luxury Taste Among Generation Z",
    authors: ["Hargun Kaur"],
  },
  {
    order: 6,
    file: "Meher_Singhi.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Research Note Short Communication From Ambition to Action: Why International Climate Agreements Failed to Address the Systems Driving Climate Change & the Provisions They Should Have Included",
    authors: ["Meher Singhi"],
  },
  {
    order: 7,
    file: "Ravi_Shingadia.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "The Impact of Instagram Followers, Age, Brand Endorsements, and Matches Played on Professional Football Players' Market Value",
    authors: ["Ravi Shingadia"],
  },
  {
    order: 8,
    file: "Ridit_Aggarwal.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "A Qualitative Systematic Review of Industrial Corrosive Substances in India Using the PRISMA Framework",
    authors: ["Ridit Aggarwal"],
  },
  {
    order: 9,
    file: "Shambhavi_Mittal.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Factors Affecting Consumer Food Price in India: An Econometric Analysis",
    authors: ["Shambhavi Mittal"],
  },
  {
    order: 10,
    file: "Siddhi_Meena.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Prompt-Induced Judgment Instability in Qwen 3.6 27B: Effects of Epistemic Certainty, Third-Person Framing, and Reasoning-Oriented Prompting",
    authors: ["Siddhi Meena"],
  },
  {
    order: 11,
    file: "Suryavir_Bhandari.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Sport Sponsorship, Branding and Marketing: A Bibliometric Analysis Using VOSviewer",
    authors: ["Suryavir Bhandari"],
  },
  {
    order: 12,
    file: "Tanzila_Naseem.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Community Perceptions of the China–Pakistan Economic Corridor: Implications for Economic, Social, and Sustainable Development",
    authors: ["Tanzila Naseem"],
  },
  {
    order: 13,
    file: "Vihana_Gaidhani.pdf",
    pageStart: "",
    pageEnd: "",
    title:
      "Assessing Public Awareness and Perceived Effectiveness of Sustainability Initiatives in Indian Railways",
    authors: ["Vihana Gaidhani"],
  },
];

/* ───────────────────── All issues — NEWEST FIRST ───────────────────── */

export const LOCAL_ISSUES: LocalIssue[] = [
  {
    id: "demo-2",
    slug: "vol-1-issue-2-2026",
    volume: 1,
    issueNumber: 2,
    year: 2026,
    monthLabel: "July–Sep",
    title: "Volume 1, Issue 2 (2026)",
    archiveDisplayName: "Issue2-Vol1[July-Sep2026]",
    publishedAt: "2026-09-30", // TODO: real publish date
    fullIssuePdf: "", // TODO: real file name
    papersFolder: "Issue2-Vol1[July-Sep2026]", // TODO: real folder name
    papers: VOL1_ISSUE2_PAPERS,
  },
  {
    id: "demo-1",
    slug: "vol-1-2026",
    aliases: ["vol-1-forthcoming"],
    volume: 1,
    issueNumber: 1,
    year: 2026,
    monthLabel: "Apr–June",
    title: "Volume 1, Issue 1 (2026)",
    archiveDisplayName: "Issue1-Vol1[Apr-June2026]",
    publishedAt: "2026-05-11",
    fullIssuePdf: "GCR Issue 1 pdf (1).pdf",
    papersFolder: "Issue1-Vol1[Apr-June2026]",
    papers: VOL1_PAPERS,
  },
];

/* ──────────────── Helpers (no changes needed per issue) ──────────────── */

type IssueRef = { slug: string; id: string };

/** URL-encode each path segment for safe links to `public/` files. */
export function publicAssetUrl(folder: string, filename: string): string {
  return `/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
}

/** Root-level public URL with correct encoding for spaces and parentheses. */
function publicRootUrl(filename: string): string {
  return "/" + encodeURIComponent(filename);
}

/** Bundled issue for a Firestore / demo issue (matched by id, slug, or alias). */
export function findLocalIssue(issue: IssueRef): LocalIssue | undefined {
  return LOCAL_ISSUES.find((local) => {
    const keys = [local.id, local.slug, ...(local.aliases ?? [])];
    return keys.includes(issue.slug) || keys.includes(issue.id);
  });
}

/**
 * Stable article ids (used as `#anchor` links). Issue 1 keeps its original
 * `vol1-paper-N` ids; later issues include the issue number.
 */
function articleId(local: LocalIssue, order: number): string {
  return local.issueNumber === 1
    ? `vol${local.volume}-paper-${order}`
    : `vol${local.volume}-issue${local.issueNumber}-paper-${order}`;
}

function toArticles(local: LocalIssue): Article[] {
  return local.papers.map(
    ({ file, pageStart, pageEnd, order, title, authors }) => ({
      id: articleId(local, order),
      title,
      authors,
      pageStart,
      pageEnd,
      pdfUrl: publicAssetUrl(local.papersFolder, file),
      orderIndex: order,
    }),
  );
}

/** All bundled issues as page data, newest first. The first one is current. */
export const localIssues: IssueWithArticles[] = LOCAL_ISSUES.map(
  (local, index) => ({
    id: local.id,
    volume: local.volume,
    issueNumber: local.issueNumber,
    year: local.year,
    monthLabel: local.monthLabel,
    title: local.title,
    archiveDisplayName: local.archiveDisplayName,
    publishedAt: local.publishedAt ? new Date(local.publishedAt) : null,
    slug: local.slug,
    isCurrent: index === 0,
    pdfUrl: local.fullIssuePdf ? publicRootUrl(local.fullIssuePdf) : undefined,
    articles: toArticles(local),
  }),
);

/** Article rows for TOC / archives. */
export function getLocalArticlesForIssueSlug(issue: IssueRef): Article[] {
  const local = findLocalIssue(issue);
  return local ? toArticles(local) : [];
}

/** Full-issue PDF bundled in `/public`, if any. */
export function getLocalFullIssuePdfUrl(issue: IssueRef): string | undefined {
  const local = findLocalIssue(issue);
  return local?.fullIssuePdf ? publicRootUrl(local.fullIssuePdf) : undefined;
}

export function mergeIssueWithLocalPapers(
  issue: IssueWithArticles,
): IssueWithArticles {
  const localPdf = getLocalFullIssuePdfUrl(issue);
  const next = localPdf ? { ...issue, pdfUrl: localPdf } : issue;
  if (next.articles.length > 0) return next;
  const local = getLocalArticlesForIssueSlug(issue);
  return local.length ? { ...next, articles: local } : next;
}

/**
 * Firestore issues plus any bundled issues Firestore doesn't have yet,
 * newest first.
 */
export function mergeIssueLists(fetched: Issue[]): Issue[] {
  const missingLocal = localIssues
    .filter(
      (local) =>
        !fetched.some((issue) => findLocalIssue(issue)?.id === local.id),
    )
    .map(({ articles: _a, ...issue }) => issue);

  return [...fetched, ...missingLocal].sort(
    (a, b) =>
      (toDateSafe(b.publishedAt)?.getTime() ?? 0) -
      (toDateSafe(a.publishedAt)?.getTime() ?? 0),
  );
}

/**
 * Newest issues for the home page. Uses the Firestore version of an issue
 * when `fetchedCurrent` is the same issue, otherwise the bundled copy.
 */
export function getHomeIssues(
  fetchedCurrent: IssueWithArticles | null,
): IssueWithArticles[] {
  return localIssues
    .slice(0, HOME_ISSUES_COUNT)
    .map((local) =>
      mergeIssueWithLocalPapers(
        fetchedCurrent && findLocalIssue(fetchedCurrent)?.id === local.id
          ? fetchedCurrent
          : local,
      ),
    );
}

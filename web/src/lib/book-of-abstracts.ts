/** Public Book of Abstracts editions — update when a PDF is published. */
export type BookOfAbstractsEdition = {
  id: string;
  title: string;
  conferenceSlug: string;
  /** Public URL under /public or external HTTPS link */
  pdfUrl?: string;
  publishedLabel?: string;
  /** Key figures shown above the download button. */
  stats?: { label: string; value: string }[];
  /** Short notice shown under the figures. */
  note?: string;
  /** "Abstract Selection Process" paragraphs. */
  selectionProcess?: string[];
  /** Sentence introducing the conference tracks. */
  tracksIntro?: string;
  /** Track names, listed under the intro. */
  tracks?: string[];
};

export const bookOfAbstractsEditions: BookOfAbstractsEdition[] = [
  {
    id: "gcr-q3-2026",
    title:
      "GCR International Multidisciplinary Conference 2026 - Book of Abstracts",
    conferenceSlug: "gcr-q3-2026",
    pdfUrl: "/GCR_Abstract.pdf",
    publishedLabel:
      "Published after abstract acceptance and conference registration",
    stats: [
      { label: "Abstracts received", value: "300+" },
      { label: "Screened", value: "All submissions" },
      { label: "Shortlisted and accepted", value: "61" },
      { label: "Tracks", value: "5" },
    ],
    selectionProcess: [
      "The GCR International Multidisciplinary Conference 2026 received over 300 abstract submissions from high-school students, undergraduates and early-career researchers. Each submission was screened for relevance to the conference theme, fit with the scope of Global Confluence Review, originality, and compliance with the basic submission requirements.",
      "After screening, 61 abstracts were shortlisted and accepted for presentation. This Book of Abstracts includes only these shortlisted and accepted abstracts.",
    ],
    tracksIntro:
      "Each accepted abstract was assigned to one of five thematic tracks",
    tracks: [
      "Track 1: Economics, Finance & Management",
      "Track 2: Public Policy, Governance & Development",
      "Track 3: Education, Psychology & Social Sciences",
      "Track 4: Humanities, Culture & Communication",
      "Track 5: STEM",
    ],
    note: "Acceptance of an abstract for presentation does not guarantee publication of a full manuscript in Global Confluence Review. Full papers go through the journal’s separate peer-review process.",
  },
];

export function getBookOfAbstractsForSlug(
  slug: string,
): BookOfAbstractsEdition | undefined {
  return bookOfAbstractsEditions.find((e) => e.conferenceSlug === slug);
}

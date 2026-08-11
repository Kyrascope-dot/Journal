/** Public Book of Abstracts editions — update when a PDF is published. */
export type BookOfAbstractsEdition = {
  id: string;
  title: string;
  conferenceSlug: string;
  /** Public URL under /public or external HTTPS link */
  pdfUrl?: string;
  publishedLabel?: string;
};

export const bookOfAbstractsEditions: BookOfAbstractsEdition[] = [
  {
    id: "gcr-q3-2026",
    title: "GCR Conference Book of Abstracts — Q3 2026",
    conferenceSlug: "gcr-q3-2026",
    publishedLabel: "Published after abstract acceptance and conference registration",
  },
];

export function getBookOfAbstractsForSlug(slug: string): BookOfAbstractsEdition | undefined {
  return bookOfAbstractsEditions.find((e) => e.conferenceSlug === slug);
}

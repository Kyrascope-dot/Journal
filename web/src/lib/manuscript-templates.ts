/** Public path segment (folder name under `/public`). */
export const MANUSCRIPT_TEMPLATE_FOLDER =
  "GCR_Complete_Manuscript_Template_Pack - Copy";

export const MANUSCRIPT_TEMPLATE_ZIP = "/GCR_Complete_Manuscript_Template_Pack.zip";

function templateHref(filename: string): string {
  return `/${encodeURIComponent(MANUSCRIPT_TEMPLATE_FOLDER)}/${encodeURIComponent(filename)}`;
}

/** Word templates in the pack (primary working files for authors). */
export const manuscriptTemplateDownloads: { label: string; href: string }[] = [
  {
    label: "Original research article",
    href: templateHref("01_Original_Research_Article.docx"),
  },
  {
    label: "Narrative review article",
    href: templateHref("02_Narrative_Review_Article.docx"),
  },
  {
    label: "Systematic review",
    href: templateHref("03_Systematic_Review.docx"),
  },
  {
    label: "Bibliometric / scientometric study",
    href: templateHref("04_Bibliometric_Scientometric_Study.docx"),
  },
  {
    label: "Policy paper",
    href: templateHref("05_Policy_Paper.docx"),
  },
  {
    label: "Research essay",
    href: templateHref("06_Research_Essay.docx"),
  },
  {
    label: "Conceptual / theoretical paper",
    href: templateHref("07_Conceptual_Theoretical_Paper.docx"),
  },
  { label: "Case study", href: templateHref("08_Case_Study.docx") },
  {
    label: "Commentary / perspective",
    href: templateHref("09_Commentary_Perspective.docx"),
  },
  { label: "Book review", href: templateHref("10_Book_Review.docx") },
  {
    label: "Research proposal",
    href: templateHref("11_Research_Proposal.docx"),
  },
  {
    label: "Research note / short communication",
    href: templateHref("12_Research_Note_Short_Communication.docx"),
  },
];

/** Manuscript types accepted for journal and conference submissions (see word limit table). */
export const manuscriptSubmissionTypes = [
  "Original Research Article",
  "Narrative Review Article",
  "Systematic Review",
  "Bibliometric / Scientometric Study",
  "Policy Paper",
  "Research Essay",
  "Conceptual / Theoretical Paper",
  "Case Study",
  "Commentary / Perspective",
  "Book Review",
  "Research Proposal",
  "Research Note / Short Communication",
] as const;

import { siteConfig } from "@/lib/site-config";

export type JournalFaq = {
  question: string;
  /** Plain-text paragraphs; also used for the FAQPage structured data. */
  answer: string[];
  links?: { href: string; label: string }[];
};

/**
 * Journal FAQs. Answers only restate what the journal's own policy pages say,
 * so keep them in sync when a policy page changes.
 */
export const journalFaqs: JournalFaq[] = [
  {
    question: "What is Global Confluence Review (GCR)?",
    answer: [
      `${siteConfig.name} (${siteConfig.shortName}) is an international, peer-reviewed, open-access, multidisciplinary journal (ISSN ${siteConfig.issn}). It is published online ${siteConfig.frequency.toLowerCase()} by ${siteConfig.publisherOrganisation}, New Delhi, India, and began publishing in ${siteConfig.startingYear}.`,
      "GCR publishes original research, reviews, essays and other scholarly work across the social sciences, humanities, STEM and interdisciplinary fields.",
    ],
    links: [{ href: "/about/journal", label: "About the Journal" }],
  },
  {
    question: "Can high school students publish research in GCR?",
    answer: [
      "Yes. GCR is open to high school students, undergraduate and postgraduate students, doctoral scholars, educators, independent researchers and professionals. High-school research papers are one of the accepted article types, and a high-school research paper template is available.",
      "Student work goes through the same editorial screening, peer review and ethics standards as every other submission, and acceptance is not guaranteed.",
    ],
    links: [
      { href: "/research/young-researchers-hub", label: "Young Researchers’ Hub" },
      { href: "/for-authors/manuscript-templates", label: "Manuscript Templates" },
    ],
  },
  {
    question: "Is GCR a peer-reviewed journal?",
    answer: [
      "Yes. GCR uses double-blind peer review: authors do not know the reviewers’ identities, and reviewers are not told the authors’ names or affiliations.",
      "Each manuscript is first screened by the editorial office for scope, formatting and ethics. Suitable manuscripts are then sent to at least two independent experts, and the handling editor decides on acceptance, revision or rejection.",
    ],
    links: [{ href: "/about/peer-review", label: "Peer Review Process" }],
  },
  {
    question: "Is GCR open access?",
    answer: [
      `Yes. All published articles are free to read and download, with no subscription or login. Articles are published under the Creative Commons Attribution 4.0 International licence (${siteConfig.license}), and authors keep the copyright of their work.`,
    ],
    links: [
      { href: "/about/open-access", label: "Open Access Policy" },
      { href: "/about/copyright-and-licensing", label: "Copyright & Licensing" },
    ],
  },
  {
    question: "Which subjects does GCR publish?",
    answer: [
      "GCR is multidisciplinary. Its scope includes anthropology and sociology; psychology and education; economics and management; law, history and cultural studies; communication and peace studies; and science, technology, engineering and mathematics (STEM), as well as interdisciplinary research.",
    ],
    links: [{ href: "/about/aims-and-scope", label: "Aims & Scope" }],
  },
  {
    question: "What types of papers can I submit?",
    answer: [
      "Original research articles, narrative and systematic reviews, bibliometric studies, policy papers, research essays, case studies, conceptual papers, interdisciplinary research, conference papers and high-school research papers, subject to the journal’s scope and quality standards.",
    ],
    links: [
      { href: "/about/aims-and-scope", label: "Aims & Scope" },
      { href: "/for-authors/author-guidelines", label: "Author Guidelines" },
    ],
  },
  {
    question: "How do I submit a manuscript to GCR?",
    answer: [
      "Create a GCR account, sign in to the author dashboard, choose New Submission → Submit for Journal Publication, and enter the paper details. You will receive a Registration ID.",
      `Then email the blinded manuscript (Word), a separate title page (Word) and the Turnitin or other plagiarism / AI report to ${siteConfig.email}, with your Registration ID in the email subject. You can track your submission under My Submissions.`,
    ],
    links: [{ href: "/for-authors/submit-manuscript", label: "Submit Manuscript" }],
  },
  {
    question: "Does GCR charge a publication fee?",
    answer: [
      "There is no fee to submit or during peer review. An article processing charge (APC) is payable only after a manuscript has been fully accepted. Fees do not influence editorial decisions.",
      "Need-based full and partial fee waivers are available; requests are reviewed individually and in confidence.",
    ],
    links: [
      { href: "/for-authors/publication-fees", label: "Publication Fees & Fee Waivers" },
      { href: "/for-authors/fee-waiver-policy", label: "Fee Waiver Policy" },
    ],
  },
  {
    question: "How long does peer review take?",
    answer: [
      "Timelines vary by field and reviewer availability. As a guide, first decisions after peer review often take 8–12 weeks.",
    ],
    links: [{ href: "/about/peer-review", label: "Peer Review Process" }],
  },
  {
    question: "Where is GCR indexed or listed?",
    answer: [
      `GCR is indexed in Google Scholar and listed in the ISSN Portal and ROAD (Directory of Open Access Scholarly Resources) under ISSN ${siteConfig.issn}. DOI registration through Crossref is planned.`,
    ],
    links: [{ href: "/about/abstracting-and-indexing", label: "Abstracting & Indexing" }],
  },
  {
    question: "How do I cite an article published in GCR?",
    answer: [
      "Every article has its own page with the title, authors, volume, issue, pages, year and a ready-to-copy citation. Open the article from its issue to find the “How to cite” section.",
    ],
    links: [{ href: "/issues", label: "All issues" }],
  },
  {
    question: "Does GCR run programmes for students?",
    answer: [
      "Yes. Alongside the journal, GCR runs the Young Researchers’ Hub, the GCR Tech Research Hub (with a student technology research competition in collaboration with IOTA Water), GCR Research Competitions and an international conference series.",
    ],
    links: [
      { href: "/research/young-researchers-hub", label: "Young Researchers’ Hub" },
      { href: "/tech-research", label: "Tech Research Hub" },
      { href: "/research-competitions", label: "Research Competitions" },
      { href: "/conferences", label: "Conferences" },
    ],
  },
  {
    question: "How can I contact the editorial office?",
    answer: [`Email the editorial office at ${siteConfig.email}.`],
    links: [{ href: "/contact", label: "Contact" }],
  },
];

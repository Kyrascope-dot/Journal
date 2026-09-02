export type NavLink = { href: string; label: string };

export type NavGroup = {
  id: string;
  label: string;
  links: NavLink[];
};

/** Primary desktop / mobile navigation groups */
export const mainNavGroups: NavGroup[] = [
  {
    id: "about-gcr",
    label: "About GCR",
    links: [
      { href: "/about/journal", label: "About the Journal" },
      { href: "/about/aims-and-scope", label: "Aims & Scope" },
      { href: "/editorial", label: "Editorial Board" },
      { href: "/about/peer-review", label: "Peer Review Process" },
      { href: "/about/open-access", label: "Open Access Policy" },
      { href: "/about/ethics", label: "Publication Ethics" },
      { href: "/about/abstracting-and-indexing", label: "Abstracting & Indexing" },
      { href: "/about/copyright-and-licensing", label: "Copyright & Licensing" },
      { href: "/about/archiving-and-preservation", label: "Archiving & Preservation" },
    ],
  },
  {
    id: "for-authors",
    label: "For Authors",
    links: [
      { href: "/for-authors/author-guidelines", label: "Author Guidelines" },
      { href: "/for-authors/manuscript-templates", label: "Manuscript Templates" },
      { href: "/for-authors/submission-checklist", label: "Submission Checklist" },
      { href: "/for-authors/submit-manuscript", label: "Submit Manuscript" },
      { href: "/for-authors/publication-fees", label: "Publication Fees & Fee Waivers" },
      { href: "/for-authors/plagiarism-policy", label: "Author Policies" },
    ],
  },
  {
    id: "research",
    label: "Research",
    links: [
      { href: "/#current-issue", label: "Current Issue" },
      { href: "/articles", label: "All Articles" },
      { href: "/issues", label: "Archives" },
      { href: "/research/young-researchers-hub", label: "Young Researchers’ Hub" },
      { href: "/tech-research", label: "Tech Research" },
      { href: "/research-competitions", label: "GCR Research Competitions" },
    ],
  },
  {
    id: "conferences",
    label: "Conferences",
    links: [
      {
        href: "/conferences",
        label: "Conference Series, Registration & Submission",
      },
      { href: "/conferences/book-of-abstracts", label: "Book of Abstracts" },
      { href: "/conferences/award-winners", label: "Award Winners" },
      { href: "/conferences/payment", label: "Conference Payment" },
      { href: "/conferences/faqs", label: "Conference FAQs" },
    ],
  },
];

export const topLevelNavLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

export const accountNavLinks: NavLink[] = [
  { href: "/dashboard?view=author", label: "Author dashboard" },
];

export const footerNavColumns: { title: string; links: NavLink[] }[] = [
  { title: "About GCR", links: mainNavGroups[0].links.slice(0, 6) },
  {
    title: "For authors",
    links: mainNavGroups[1].links.slice(0, 6),
  },
  { title: "Research", links: mainNavGroups[2].links },
  { title: "Conferences", links: mainNavGroups[3].links.slice(0, 5) },
];

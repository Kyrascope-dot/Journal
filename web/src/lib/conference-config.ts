/** Admin-configurable conference preview — replace with Firestore when CMS ships. */
export const featuredConference = {
  slug: "gcr-q3-2026",
  title: "GCR Conference + Colloquia/Workshop Q3, July–September Issue 2026",
  theme: "Innovation, Sustainability and Inclusive Development",
  mode: "Online via Zoom",
  datesLabel: "30 August 2026",
  conferenceTime: "9:30 AM IST",
  colloquiaDateLabel: "29 August 2026",
  colloquiaTime: "9:30 AM IST",
  registrationDeadline: "25 August 2026",
  submissionDeadline: "25 August 2026",
};

export const quarterlyConferenceSeries = [
  {
    quarter: "Quarter I",
    period: "January–March",
  },
  {
    quarter: "Quarter II",
    period: "April–June",
  },
  {
    quarter: "Quarter III",
    period: "July–September",
  },
  {
    quarter: "Quarter IV",
    period: "October–December",
  },
] as const;

export const conferencePublicationHomepageLead =
  "All enrolled conference authors have the opportunity to submit their full research manuscript for consideration for publication in Global Confluence Review (GCR), subject to double-blind peer review, plagiarism screening, editorial evaluation, author revisions where required, and applicable publication standards.";

export const conferencePublicationHomepageDisclaimer =
  "Conference registration does not guarantee publication.";

/** Homepage conference preview — concise publication note. */
export const conferencePublicationDisclaimer = conferencePublicationHomepageLead;

export const conferenceRegistrationDisclaimer =
  "Conference registration provides an opportunity to submit a manuscript for publication consideration; it does not guarantee publication.";

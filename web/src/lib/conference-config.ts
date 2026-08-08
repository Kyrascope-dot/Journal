/** Admin-configurable conference preview — replace with Firestore when CMS ships. */
export const featuredConference = {
  slug: "gcr-q3-2026",
  title: "GCR Conference + Colloquia/Workshop Q3, July–September Issue 2026",
  theme: "Innovation, Sustainability and Inclusive Development",
  mode: "Online via Zoom",
  datesLabel: "30 August 2026",
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

export const conferencePublicationDisclaimer =
  "Selected conference papers may be considered for publication in Global Confluence Review (GCR), subject to peer review, plagiarism screening, editorial evaluation, author revisions, and the journal’s publication schedule.";

export const conferenceRegistrationDisclaimer =
  "Conference participation does not guarantee journal publication. Selected manuscripts may be considered for publication subject to the journal’s peer-review process, editorial evaluation, author revisions, and publication schedule.";

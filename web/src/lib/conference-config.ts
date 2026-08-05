/** Admin-configurable conference preview — replace with Firestore when CMS ships. */
export const featuredConference = {
  slug: "gcr-q2-2026",
  title: "GCR International Conference — Quarter II",
  theme: "Innovation, Sustainability and Development",
  mode: "Online",
  datesLabel: "April–June 2026 (schedule to be announced)",
  registrationDeadline: "To be announced",
  submissionDeadline: "To be announced",
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

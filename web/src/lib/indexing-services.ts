/** Placeholder indexation records — replace with admin CMS / Firestore. */
export type IndexingStatus =
  | "Indexed"
  | "Listed"
  | "Discoverable"
  | "Application submitted"
  | "Under technical preparation"
  | "Planned";

export type IndexingRecord = {
  id: string;
  serviceName: string;
  status: IndexingStatus;
  verificationUrl?: string;
  dateVerified?: string;
  notes: string;
};

export function getIndexingServicesForPublic(): {
  id: string;
  name: string;
  status: IndexingStatus;
  verificationUrl?: string;
  dateVerified?: string;
  notes?: string;
}[] {
  return defaultIndexingRecords.map((r) => ({
    id: r.id,
    name: r.serviceName,
    status: r.status,
    verificationUrl: r.verificationUrl,
    dateVerified: r.dateVerified,
    notes: r.notes,
  }));
}

export const defaultIndexingRecords: IndexingRecord[] = [
  {
    id: "google-scholar",
    serviceName: "Google Scholar",
    status: "Indexed",
    notes:
      "Global Confluence Review is indexed in Google Scholar. Published articles are discoverable through Google Scholar search.",
  },
  {
    id: "crossref",
    serviceName: "Crossref",
    status: "Planned",
    notes: "DOI registration will be enabled when the journal’s Crossref membership is active.",
  },
];

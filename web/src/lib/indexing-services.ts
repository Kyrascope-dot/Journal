import { siteConfig } from "@/lib/site-config";

/** The journal's public record in the ISSN Portal (also shows the ROAD listing). */
export const ISSN_RECORD_URL = `https://portal.issn.org/resource/ISSN/${siteConfig.issn}`;

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
    id: "issn-portal",
    serviceName: "ISSN Portal",
    status: "Listed",
    verificationUrl: ISSN_RECORD_URL,
    notes:
      "Global Confluence Review is listed in the ISSN Portal. ISSN: 3139-6690. Publisher: New Delhi; Bliss Global.",
  },
  {
    id: "road",
    serviceName: "ROAD (Directory of Open Access Scholarly Resources)",
    status: "Listed",
    verificationUrl: ISSN_RECORD_URL,
    notes:
      "Global Confluence Review appears in ROAD, the Directory of Open Access Scholarly Resources. The ROAD logo appears under “Resource information” in the journal’s ISSN Portal record.",
  },
  {
    id: "crossref",
    serviceName: "Crossref",
    status: "Planned",
    notes: "DOI registration will be enabled when the journal’s Crossref membership is active.",
  },
];

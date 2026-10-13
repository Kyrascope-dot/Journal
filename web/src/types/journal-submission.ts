import { HOME_COUNTRY, isKnownCountry } from "@/lib/countries";

/**
 * Extra questions asked when an author chooses "Submit for journal publication".
 * Shared by the submission form, the server route (validation), and dashboards.
 */

export const RESEARCH_WORK_TYPES = [
  "Original research article",
  "Narrative review article",
  "Systematic review",
  "Bibliometric / scientometric study",
  "Policy paper",
  "Research essay",
  "Conceptual / theoretical paper",
  "Case study",
  "Commentary / perspective",
  "Book review",
  "Research proposal",
  "Research note / short communication",
] as const;

export type ResearchWorkType = (typeof RESEARCH_WORK_TYPES)[number];

export type JournalAuthorRegion = "national" | "international";
export type JournalReviewRoute = "normal" | "fast_track";
export type JournalFundingStatus = "funded" | "not_funded";

export const JOURNAL_AUTHOR_REGION_OPTIONS: {
  value: JournalAuthorRegion;
  label: string;
}[] = [
  { value: "national", label: "National author (India)" },
  { value: "international", label: "International author" },
];

export const JOURNAL_REVIEW_ROUTE_OPTIONS: {
  value: JournalReviewRoute;
  label: string;
}[] = [
  { value: "normal", label: "Normal route (review within 2 months)" },
  {
    value: "fast_track",
    label: "Fast-track / expedited route (review within a week)",
  },
];

export const JOURNAL_FUNDING_OPTIONS: {
  value: JournalFundingStatus;
  label: string;
}[] = [
  { value: "funded", label: "Funded" },
  { value: "not_funded", label: "Not funded" },
];

export const JOURNAL_AUTHOR_REGION_LABELS: Record<JournalAuthorRegion, string> = {
  national: "National author (India)",
  international: "International author",
};

export const JOURNAL_REVIEW_ROUTE_LABELS: Record<JournalReviewRoute, string> = {
  normal: "Normal route (review within 2 months)",
  fast_track: "Fast-track / expedited route (review within a week)",
};

export const JOURNAL_FUNDING_LABELS: Record<JournalFundingStatus, string> = {
  funded: "Funded",
  not_funded: "Not funded",
};

export type CoAuthorCountry = { name: string; country: string };

export type JournalSubmissionDetails = {
  authorRegion: JournalAuthorRegion;
  authorCountry: string;
  /** One entry per co-author (empty when there are no co-authors). */
  coAuthorCountries: CoAuthorCountry[];
  reviewRoute: JournalReviewRoute;
  /** No longer asked; kept so submissions made while it was on the form still show it. */
  mentorName: string | null;
  researchWorkType: ResearchWorkType;
  orcid: string | null;
  aiUsageUnder20Percent: boolean;
  notUnderConsiderationElsewhere: boolean;
  wordCount: number;
  conflictOfInterest: boolean;
  conflictOfInterestDetails: string | null;
  fundingStatus: JournalFundingStatus;
  supplementaryFiles: boolean;
  feeWaiverRequested: boolean;
  /** For invoice purposes only. */
  homeAddress: string;
};

const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

/** Accepts "0000-0002-1825-0097" or an orcid.org URL; returns the bare iD or null. */
export function normalizeOrcid(value: string): string | null {
  const bare = value
    .trim()
    .replace(/^https?:\/\/(www\.)?orcid\.org\//i, "")
    .toUpperCase();
  return ORCID_PATTERN.test(bare) ? bare : null;
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type JournalDetailsValidation =
  | { ok: true; details: JournalSubmissionDetails }
  | { ok: false; error: string };

/**
 * Validates the journal questions. `coAuthors` is the cleaned co-author name
 * list; every co-author must have a country.
 */
export function validateJournalSubmissionDetails(
  raw: unknown,
  coAuthors: string[],
): JournalDetailsValidation {
  const fail = (error: string): JournalDetailsValidation => ({ ok: false, error });
  if (!isRecord(raw)) {
    return fail("Please complete the journal submission questions.");
  }

  const authorRegion = raw.authorRegion;
  if (authorRegion !== "national" && authorRegion !== "international") {
    return fail("Please select whether you are a National author (India) or an International author.");
  }

  const authorCountry =
    authorRegion === "national" ? HOME_COUNTRY : text(raw.authorCountry, 100);
  if (!authorCountry || !isKnownCountry(authorCountry)) {
    return fail("Please select the country of the author.");
  }
  if (authorRegion === "international" && authorCountry === HOME_COUNTRY) {
    return fail(
      "International authors must select a country other than India. Choose National author (India) if you are based in India.",
    );
  }

  const rawCoAuthorCountries = Array.isArray(raw.coAuthorCountries)
    ? raw.coAuthorCountries.filter(isRecord)
    : [];
  const coAuthorCountries: CoAuthorCountry[] = [];
  for (const name of coAuthors) {
    const match = rawCoAuthorCountries.find(
      (entry) => text(entry.name, 300).toLowerCase() === name.toLowerCase(),
    );
    const country = match ? text(match.country, 100) : "";
    if (!country || !isKnownCountry(country)) {
      return fail(`Please select the country of co-author "${name}".`);
    }
    coAuthorCountries.push({ name, country });
  }

  const reviewRoute = raw.reviewRoute;
  if (reviewRoute !== "normal" && reviewRoute !== "fast_track") {
    return fail("Please select the Normal route or the Fast-track / expedited route.");
  }

  const researchWorkType = text(raw.researchWorkType, 100);
  if (!(RESEARCH_WORK_TYPES as readonly string[]).includes(researchWorkType)) {
    return fail("Please select the type of research work.");
  }

  const orcidInput = text(raw.orcid, 100);
  const orcid = orcidInput ? normalizeOrcid(orcidInput) : null;
  if (orcidInput && !orcid) {
    return fail("Please enter a valid ORCID iD (for example 0000-0002-1825-0097) or leave it blank.");
  }

  if (typeof raw.aiUsageUnder20Percent !== "boolean") {
    return fail("Please state whether AI usage in the paper is less than 20%.");
  }

  if (raw.notUnderConsiderationElsewhere !== true) {
    return fail(
      "Please confirm that the manuscript is not under consideration at another journal.",
    );
  }

  const wordCount = Number(raw.wordCount);
  if (!Number.isInteger(wordCount) || wordCount < 1 || wordCount > 1_000_000) {
    return fail("Please state the total word count as a whole number.");
  }

  if (typeof raw.conflictOfInterest !== "boolean") {
    return fail("Please state whether there is a conflict of interest.");
  }
  const conflictOfInterestDetails = raw.conflictOfInterest
    ? text(raw.conflictOfInterestDetails, 2000)
    : "";
  if (raw.conflictOfInterest && !conflictOfInterestDetails) {
    return fail("Please give details of the conflict of interest.");
  }

  const fundingStatus = raw.fundingStatus;
  if (fundingStatus !== "funded" && fundingStatus !== "not_funded") {
    return fail("Please select the funding declaration (Funded / Not funded).");
  }

  if (typeof raw.supplementaryFiles !== "boolean") {
    return fail("Please state whether you are submitting supplementary files.");
  }

  if (typeof raw.feeWaiverRequested !== "boolean") {
    return fail(
      "Please state whether you will be considering to apply for a fee waiver if your manuscript gets accepted.",
    );
  }

  const homeAddress = text(raw.homeAddress, 1000);
  if (!homeAddress) {
    return fail("Please enter the home address of the author (for invoice purposes).");
  }

  return {
    ok: true,
    details: {
      authorRegion,
      authorCountry,
      coAuthorCountries,
      reviewRoute,
      mentorName: null,
      researchWorkType: researchWorkType as ResearchWorkType,
      orcid,
      aiUsageUnder20Percent: raw.aiUsageUnder20Percent,
      notUnderConsiderationElsewhere: true,
      wordCount,
      conflictOfInterest: raw.conflictOfInterest,
      conflictOfInterestDetails: conflictOfInterestDetails || null,
      fundingStatus,
      supplementaryFiles: raw.supplementaryFiles,
      feeWaiverRequested: raw.feeWaiverRequested,
      homeAddress,
    },
  };
}

/**
 * Reads the stored `journalDetails` map from Firestore. Lenient: returns null
 * for older submissions created before these questions existed.
 */
export function parseStoredJournalDetails(raw: unknown): JournalSubmissionDetails | null {
  if (!isRecord(raw)) return null;
  if (raw.authorRegion !== "national" && raw.authorRegion !== "international") {
    return null;
  }
  return {
    authorRegion: raw.authorRegion,
    authorCountry: text(raw.authorCountry, 100),
    coAuthorCountries: Array.isArray(raw.coAuthorCountries)
      ? raw.coAuthorCountries.filter(isRecord).map((entry) => ({
          name: text(entry.name, 300),
          country: text(entry.country, 100),
        }))
      : [],
    reviewRoute: raw.reviewRoute === "fast_track" ? "fast_track" : "normal",
    mentorName: text(raw.mentorName, 300) || null,
    researchWorkType: text(raw.researchWorkType, 100) as ResearchWorkType,
    orcid: text(raw.orcid, 100) || null,
    aiUsageUnder20Percent: raw.aiUsageUnder20Percent === true,
    notUnderConsiderationElsewhere: raw.notUnderConsiderationElsewhere === true,
    wordCount: Number(raw.wordCount) || 0,
    conflictOfInterest: raw.conflictOfInterest === true,
    conflictOfInterestDetails: text(raw.conflictOfInterestDetails, 2000) || null,
    fundingStatus: raw.fundingStatus === "funded" ? "funded" : "not_funded",
    supplementaryFiles: raw.supplementaryFiles === true,
    feeWaiverRequested: raw.feeWaiverRequested === true,
    homeAddress: text(raw.homeAddress, 1000),
  };
}

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/**
 * Label/value rows for showing the answers in dashboards.
 * `includeAddress` is for the author and admins only (invoice details).
 */
export function journalDetailRows(
  details: JournalSubmissionDetails,
  options: { includeAddress: boolean },
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Author category", value: JOURNAL_AUTHOR_REGION_LABELS[details.authorRegion] },
    { label: "Country of author", value: details.authorCountry || "—" },
    {
      label: "Country of co-authors",
      value: details.coAuthorCountries.length
        ? details.coAuthorCountries
            .map((entry) => `${entry.name} (${entry.country})`)
            .join(", ")
        : "No co-authors",
    },
    { label: "Publication route", value: JOURNAL_REVIEW_ROUTE_LABELS[details.reviewRoute] },
    ...(details.mentorName ? [{ label: "Name of mentor", value: details.mentorName }] : []),
    { label: "Type of research work", value: details.researchWorkType || "—" },
    { label: "ORCID", value: details.orcid ?? "Not provided" },
    { label: "AI usage less than 20%", value: yesNo(details.aiUsageUnder20Percent) },
    {
      label: "Not under consideration at another journal",
      value: details.notUnderConsiderationElsewhere ? "Confirmed" : "Not confirmed",
    },
    {
      label: "Total word count",
      value: details.wordCount ? details.wordCount.toLocaleString("en-IN") : "—",
    },
    {
      label: "Conflict of interest",
      value: details.conflictOfInterest
        ? `Yes — ${details.conflictOfInterestDetails ?? "no details given"}`
        : "No",
    },
    { label: "Funding declaration", value: JOURNAL_FUNDING_LABELS[details.fundingStatus] },
    { label: "Supplementary files", value: yesNo(details.supplementaryFiles) },
    {
      label: "Considering a fee waiver if the manuscript is accepted",
      value: yesNo(details.feeWaiverRequested),
    },
  ];
  if (options.includeAddress) {
    rows.push({
      label: "Home address (for invoice)",
      value: details.homeAddress || "—",
    });
  }
  return rows;
}

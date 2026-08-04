import { siteConfig } from "@/lib/site-config";

/** Display ISSN for public UI. Replace with Firestore `journal_settings` when admin CMS ships. */
export function getDisplayIssn(): string {
  const raw = siteConfig.issn?.trim();
  return raw ? raw : "To be updated";
}

export function getIssnLabel(): string {
  return `ISSN: ${getDisplayIssn()}`;
}

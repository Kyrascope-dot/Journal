/** Bootstrap admin emails (server + client). */
export const ADMIN_EMAILS = [
  "sonam.dobriyal@athenaeducation.co.in",
  "editor@globalconfluencereview.in",
] as const;

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}

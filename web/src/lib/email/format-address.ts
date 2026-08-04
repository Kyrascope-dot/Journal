import { siteConfig } from "@/lib/site-config";

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Resend expects `Name <email@domain.com>` or a plain verified address. */
export function formatResendFromAddress(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return `${siteConfig.name} <onboarding@resend.dev>`;
  }
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }
  if (!EMAIL_RE.test(trimmed)) {
    throw new Error(
      `EMAIL_FROM is not a valid email address: "${trimmed}". Use editor@yourdomain.com or "${siteConfig.name} <editor@yourdomain.com>".`
    );
  }
  return `${siteConfig.name} <${trimmed}>`;
}

export function assertValidRecipientEmail(email: string, label = "Recipient"): string {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    throw new Error(`${label} email is not valid: "${trimmed}".`);
  }
  return trimmed;
}

export function formatResendError(message: string): string {
  if (/did not match the expected pattern/i.test(message)) {
    return [
      "Email could not be sent: the from/to address format was rejected.",
      "Check EMAIL_FROM in .env (use a domain verified in Resend, e.g. Global Confluence Review <notifications@yourdomain.com>).",
      "On Resend’s free plan you can only send from onboarding@resend.dev until your domain is verified.",
    ].join(" ");
  }
  return message;
}

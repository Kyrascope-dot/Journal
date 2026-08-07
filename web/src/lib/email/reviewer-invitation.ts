import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";
import {
  assertValidRecipientEmail,
  formatResendError,
  formatResendFromAddress,
} from "@/lib/email/format-address";

export type ReviewerInvitationPayload = {
  reviewerEmail: string;
  reviewerName: string;
  registrationId: string;
  title: string;
  submittedAt: string;
  submissionType: string;
  abstract: string;
  category: string;
  status: string;
  dashboardUrl: string;
};

function buildPlainText(p: ReviewerInvitationPayload): string {
  return [
    `Dear ${p.reviewerName},`,
    "",
    `You have been invited to peer-review a manuscript for ${siteConfig.name}.`,
    "",
    `Registration ID: ${p.registrationId}`,
    `Paper Title: ${p.title}`,
    `Submission Date: ${p.submittedAt}`,
    `Submission Type: ${p.submissionType}`,
    `Category: ${p.category}`,
    `Status: ${p.status}`,
    "",
    "Abstract:",
    p.abstract,
    "",
    `Sign in to your reviewer dashboard to view details and submit comments:`,
    p.dashboardUrl,
    "",
    `Editorial office: ${process.env.EDITORIAL_EMAIL ?? siteConfig.email}`,
    "",
    "Please treat manuscript details as confidential.",
    "",
    siteConfig.name,
  ].join("\n");
}

function buildHtml(p: ReviewerInvitationPayload): string {
  const editorial = process.env.EDITORIAL_EMAIL ?? siteConfig.email;
  return `<!DOCTYPE html>
<html><body style="font-family:Georgia,serif;color:#1a1a1a;line-height:1.5;max-width:640px">
  <p>Dear ${escapeHtml(p.reviewerName)},</p>
  <p>You have been invited to peer-review a manuscript for <strong>${escapeHtml(siteConfig.name)}</strong>.</p>
  <table style="margin:16px 0;border-collapse:collapse;width:100%;font-size:14px">
    <tr><td style="padding:6px 0;color:#666">Registration ID</td><td style="padding:6px 0"><strong>${escapeHtml(p.registrationId)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#666;vertical-align:top">Paper Title</td><td style="padding:6px 0">${escapeHtml(p.title)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Submission Date</td><td style="padding:6px 0">${escapeHtml(p.submittedAt)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Submission Type</td><td style="padding:6px 0">${escapeHtml(p.submissionType)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Category</td><td style="padding:6px 0">${escapeHtml(p.category)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Status</td><td style="padding:6px 0">${escapeHtml(p.status)}</td></tr>
  </table>
  <p style="font-size:14px;font-weight:bold;margin-bottom:4px">Abstract</p>
  <p style="font-size:14px;margin-top:0">${escapeHtml(p.abstract)}</p>
  <p><a href="${escapeHtml(p.dashboardUrl)}" style="display:inline-block;background:#1e4d8c;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px">Open reviewer dashboard</a></p>
  <p style="font-size:13px;color:#555">Editorial office: <a href="mailto:${escapeHtml(editorial)}">${escapeHtml(editorial)}</a></p>
  <p style="font-size:12px;color:#777">Please treat manuscript details as confidential. Author identity is not included in this message.</p>
  <p style="font-size:13px;color:#555">${escapeHtml(siteConfig.name)}</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendReviewerInvitationEmail(
  payload: ReviewerInvitationPayload
): Promise<{ messageId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from = formatResendFromAddress(process.env.EMAIL_FROM);
  const to = assertValidRecipientEmail(payload.reviewerEmail, "Reviewer");
  const replyTo = assertValidRecipientEmail(
    process.env.EDITORIAL_EMAIL ?? siteConfig.email,
    "Reply-to"
  );

  const resend = new Resend(apiKey);
  const subject = `Peer review invitation — ${payload.registrationId} — ${payload.title.slice(0, 60)}${payload.title.length > 60 ? "…" : ""}`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    html: buildHtml(payload),
    text: buildPlainText(payload),
  });

  if (error) {
    throw new Error(formatResendError(error.message));
  }

  return { messageId: data?.id ?? null };
}

export function getSiteBaseUrl(): string {
  const url = process.env.SITE_URL?.trim() || siteConfig.siteUrl?.trim();
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

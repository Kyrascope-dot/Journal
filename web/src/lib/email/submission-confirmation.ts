import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";
import {
  assertValidRecipientEmail,
  formatResendError,
  formatResendFromAddress,
} from "@/lib/email/format-address";

export type SubmissionConfirmationPayload = {
  authorEmail: string;
  authorName: string;
  registrationId: string;
  title: string;
  submissionType: string;
  submittedAt: string;
  status: string;
  dashboardUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPlainText(payload: SubmissionConfirmationPayload): string {
  return [
    `Dear ${payload.authorName},`,
    "",
    `Your submission to ${siteConfig.name} has been received.`,
    "",
    `Registration ID: ${payload.registrationId}`,
    `Paper Title: ${payload.title}`,
    `Submission Date: ${payload.submittedAt}`,
    `Submission Type: ${payload.submissionType}`,
    `Current Status: ${payload.status}`,
    "",
    "Keep your Registration ID for all future communication about this submission.",
    `View your submission: ${payload.dashboardUrl}`,
    "",
    `Editorial office: ${process.env.EDITORIAL_EMAIL ?? siteConfig.email}`,
  ].join("\n");
}

function buildHtml(payload: SubmissionConfirmationPayload): string {
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.5;max-width:640px">
  <p>Dear ${escapeHtml(payload.authorName)},</p>
  <p>Your submission to <strong>${escapeHtml(siteConfig.name)}</strong> has been received.</p>
  <table style="margin:16px 0;border-collapse:collapse;width:100%;font-size:14px">
    <tr><td style="padding:6px 0;color:#666">Registration ID</td><td style="padding:6px 0"><strong>${escapeHtml(payload.registrationId)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#666">Paper Title</td><td style="padding:6px 0">${escapeHtml(payload.title)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Submission Date</td><td style="padding:6px 0">${escapeHtml(payload.submittedAt)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Submission Type</td><td style="padding:6px 0">${escapeHtml(payload.submissionType)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Current Status</td><td style="padding:6px 0">${escapeHtml(payload.status)}</td></tr>
  </table>
  <p>Keep your Registration ID for all future communication about this submission.</p>
  <p><a href="${escapeHtml(payload.dashboardUrl)}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px">Open author dashboard</a></p>
  <p style="font-size:13px;color:#555">Editorial office: ${escapeHtml(process.env.EDITORIAL_EMAIL ?? siteConfig.email)}</p>
</body></html>`;
}

export async function sendSubmissionConfirmationEmail(
  payload: SubmissionConfirmationPayload
): Promise<{ messageId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const resend = new Resend(apiKey);
  const to = assertValidRecipientEmail(payload.authorEmail, "Author");
  const replyTo = assertValidRecipientEmail(
    process.env.EDITORIAL_EMAIL ?? siteConfig.email,
    "Reply-to"
  );
  const { data, error } = await resend.emails.send({
    from: formatResendFromAddress(process.env.EMAIL_FROM),
    to,
    replyTo,
    subject: `Submission received — ${payload.registrationId}`,
    html: buildHtml(payload),
    text: buildPlainText(payload),
  });

  if (error) throw new Error(formatResendError(error.message));
  return { messageId: data?.id ?? null };
}
